import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../assets/styles/LocationPicker.css';
import styled from 'styled-components';

const RouteInfoPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  color: #333;
  z-index: 1000;
  max-width: 300px;
`;

const RouteLabel = styled.p`
  margin: 5px 0;
  display: flex;
  align-items: center;
`;

const RouteColor = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  font-weight: bold;
  margin: 5px 0;
`;

const DeleveryMap = ({
  isOpen,
  onClose,
  onLocationChange,
  onAddressChange,
  onSelect,
  initialAddress,
  pickupCoordinates,
  deliveryCoordinates,
  transporterCoordinates,
  donorName,
  recipientName,
  transporterName,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [location, setLocation] = useState({ type: 'Point', coordinates: [10.208, 36.860] });
  const [address, setAddress] = useState(initialAddress || '');
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [normalRoute, setNormalRoute] = useState(null);
  const [totalOptimizedDuration, setTotalOptimizedDuration] = useState(0);
  const [totalNormalDuration, setTotalNormalDuration] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format duration from seconds to a readable string (e.g., "1h 23m" or "45m")
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      console.warn('Invalid duration:', seconds);
      return 'Unknown';
    }
    console.log('Formatted duration (seconds):', seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes} min`;
    return `${secs} sec`;
  };

  // Fonction pour récupérer la météo avec Open-Meteo
  const fetchWeatherData = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      const weatherCode = data.current_weather.weathercode;
      // Traduire le code météo (simplifié) : https://open-meteo.com/en/docs#weathervariables
      if (weatherCode === 0) return 'Clear';
      if (weatherCode >= 61 && weatherCode <= 67) return 'Rain';
      if (weatherCode >= 71 && weatherCode <= 77) return 'Snow';
      return 'Clouds'; // Par défaut, inclut tous les autres cas
    } catch (error) {
      console.error('Error fetching weather:', error);
      return 'Clouds'; // Retourner une valeur par défaut compatible avec weather_encoder
    }
  };

  // Fonction pour simuler et logger les données (pour le CSV)
  const logTripData = async (start, end, osrmDuration, distance, predictedDuration) => {
    const currentHour = new Date().getHours();
    const weather = await fetchWeatherData((start[1] + end[1]) / 2, (start[0] + end[0]) / 2);

    const tripData = {
      distance: distance / 1000, // Convertir en km
      osrmDuration, // Durée estimée par OSRM (secondes)
      hour: currentHour,
      weather,
      realDuration: predictedDuration || osrmDuration, // Utiliser la durée prédite ou OSRM comme fallback
    };
    console.log('Trip Data:', tripData);
    return tripData;
  };

  // Fetch route data using OSRM API
  const fetchRoute = async (coordinates) => {
    console.log('Fetching route with coordinates:', coordinates);
    if (coordinates.length < 2) {
      console.error('Not enough coordinates for route calculation:', coordinates);
      return null;
    }
    if (coordinates.some(coord => !coord || coord[0] === 0 || coord[1] === 0)) {
      console.error('Invalid coordinates for route calculation:', coordinates);
      return null;
    }
    try {
      const coordsString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      const url = `http://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error('OSRM API request failed:', response.status, response.statusText);
        return null;
      }
      const data = await response.json();
      console.log('OSRM Response:', data);
      if (data.routes && data.routes.length > 0) {
        return {
          geometry: data.routes[0].geometry,
          duration: data.routes[0].duration,
          distance: data.routes[0].distance,
        };
      } else {
        console.error('No routes found in OSRM response:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };

  // Fonction pour prédire la durée avec l'IA
  const predictDuration = async (distance, osrmDuration, hour, weather) => {
    try {
      // Vérifier que la valeur de weather est valide
      const validWeatherValues = ['Clear', 'Rain', 'Snow', 'Clouds'];
      if (!validWeatherValues.includes(weather)) {
        console.warn(`Invalid weather value: ${weather}. Defaulting to 'Clouds'.`);
        weather = 'Clouds';
      }

      const response = await fetch('http://localhost:5000/predict_duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance: distance / 1000, // Convertir en km
          osrmDuration: osrmDuration,
          hour: hour,
          weather: weather,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to predict duration: ${errorText}`);
      }
      const data = await response.json();
      if (!data.predictedDuration || isNaN(data.predictedDuration)) {
        throw new Error('Invalid predicted duration received from API');
      }
      console.log('Predicted duration:', data.predictedDuration);
      return data.predictedDuration;
    } catch (error) {
      console.error('Error predicting duration:', error);
      // Fallback : ajuster manuellement la durée OSRM
      let adjustmentFactor = 1;
      if (hour >= 7 && hour <= 9) adjustmentFactor += 0.2; // Heure de pointe matin
      if (hour >= 17 && hour <= 19) adjustmentFactor += 0.2; // Heure de pointe soir
      if (weather === 'Rain' || weather === 'Snow') adjustmentFactor += 0.2;
      const fallbackDuration = osrmDuration * adjustmentFactor;
      console.log('Falling back to adjusted OSRM duration:', fallbackDuration);
      return fallbackDuration;
    }
  };

  // Calculate an intermediate waypoint to force a different path
  const calculateIntermediateWaypoint = (start, end) => {
    const midLat = (start[1] + end[1]) / 2;
    const midLng = (start[0] + end[0]) / 2;
    const offset = 0.02; // ~2km offset
    return [midLng + offset, midLat + offset];
  };

  // Calculate both routes and assign the faster one as optimized using ML predictions
  const calculateRoutes = async () => {
    console.log('Input Coordinates:', {
      transporterCoordinates,
      pickupCoordinates,
      deliveryCoordinates,
    });

    if (!transporterCoordinates || !pickupCoordinates || !deliveryCoordinates) {
      setErrorMessage('Missing coordinates for one or more points (Transporter, Donor, Recipient).');
      return;
    }

    const points = [
      { name: 'transporter', coords: transporterCoordinates.coordinates, label: transporterName || 'Transporter' },
      { name: 'pickup', coords: pickupCoordinates.coordinates, label: donorName || 'Donor' },
      { name: 'delivery', coords: deliveryCoordinates.coordinates, label: recipientName || 'Recipient' },
    ].filter(point => point.coords && point.coords[0] !== 0 && point.coords[1] !== 0);

    console.log('Filtered Points:', points);

    if (points.length < 3) {
      setErrorMessage(`Insufficient valid coordinates. Found ${points.length}/3 valid points.`);
      return;
    }

    const transporter = points.find(p => p.name === 'transporter');
    const donor = points.find(p => p.name === 'pickup');
    const recipient = points.find(p => p.name === 'delivery');

    // Récupérer la météo au point moyen du trajet
    const midLat = (transporter.coords[1] + recipient.coords[1]) / 2;
    const midLng = (transporter.coords[0] + recipient.coords[0]) / 2;
    const weather = await fetchWeatherData(midLat, midLng);
    const currentHour = new Date().getHours();

    // Route 1: Direct Route (Transporter -> Donor -> Recipient)
    const route1Geometries = [];
    let route1Dur = 0;

    // Transporter to Donor (direct)
    let transporterToDonor1 = await fetchRoute([transporter.coords, donor.coords]);
    if (transporterToDonor1) {
      const predictedDur = await predictDuration(
        transporterToDonor1.distance,
        transporterToDonor1.duration,
        currentHour,
        weather
      );
      await logTripData(
        transporter.coords,
        donor.coords,
        transporterToDonor1.duration,
        transporterToDonor1.distance,
        predictedDur
      );
      route1Dur += predictedDur;
      route1Geometries.push({
        from: transporter.label,
        to: donor.label,
        geometry: transporterToDonor1.geometry,
        duration: predictedDur,
      });
    } else {
      setErrorMessage('Failed to fetch direct route from Transporter to Donor.');
      return;
    }

    // Donor to Recipient (direct)
    let donorToRecipient1 = await fetchRoute([donor.coords, recipient.coords]);
    if (donorToRecipient1) {
      const predictedDur = await predictDuration(
        donorToRecipient1.distance,
        donorToRecipient1.duration,
        currentHour,
        weather
      );
      await logTripData(
        donor.coords,
        recipient.coords,
        donorToRecipient1.duration,
        donorToRecipient1.distance,
        predictedDur
      );
      route1Dur += predictedDur;
      route1Geometries.push({
        from: donor.label,
        to: recipient.label,
        geometry: donorToRecipient1.geometry,
        duration: predictedDur,
      });
    } else {
      setErrorMessage('Failed to fetch direct route from Donor to Recipient.');
      return;
    }

    // Route 2: Alternative Route with Intermediate Waypoints
    const route2Geometries = [];
    let route2Dur = 0;

    // Transporter to Donor with an intermediate waypoint
    const intermediate1 = calculateIntermediateWaypoint(transporter.coords, donor.coords);
    let transporterToDonor2 = await fetchRoute([transporter.coords, intermediate1, donor.coords]);
    if (transporterToDonor2) {
      const predictedDur = await predictDuration(
        transporterToDonor2.distance,
        transporterToDonor2.duration,
        currentHour,
        weather
      );
      await logTripData(
        transporter.coords,
        donor.coords,
        transporterToDonor2.duration,
        transporterToDonor2.distance,
        predictedDur
      );
      route2Dur += predictedDur;
      route2Geometries.push({
        from: transporter.label,
        to: donor.label,
        geometry: transporterToDonor2.geometry,
        duration: predictedDur,
      });
    } else {
      setErrorMessage('Failed to fetch alternative route from Transporter to Donor.');
      return;
    }

    // Donor to Recipient with an intermediate waypoint
    const intermediate2 = calculateIntermediateWaypoint(donor.coords, recipient.coords);
    let donorToRecipient2 = await fetchRoute([donor.coords, intermediate2, recipient.coords]);
    if (donorToRecipient2) {
      const predictedDur = await predictDuration(
        donorToRecipient2.distance,
        donorToRecipient2.duration,
        currentHour,
        weather
      );
      await logTripData(
        donor.coords,
        recipient.coords,
        donorToRecipient2.duration,
        donorToRecipient2.distance,
        predictedDur
      );
      route2Dur += predictedDur;
      route2Geometries.push({
        from: donor.label,
        to: recipient.label,
        geometry: donorToRecipient2.geometry,
        duration: predictedDur,
      });
    } else {
      setErrorMessage('Failed to fetch alternative route from Donor to Recipient.');
      return;
    }

    // Compare total durations and assign routes
    if (route1Dur <= route2Dur) {
      setOptimizedRoute({ geometries: route1Geometries });
      setTotalOptimizedDuration(route1Dur);
      setNormalRoute({ geometries: route2Geometries });
      setTotalNormalDuration(route2Dur);
    } else {
      setOptimizedRoute({ geometries: route2Geometries });
      setTotalOptimizedDuration(route2Dur);
      setNormalRoute({ geometries: route1Geometries });
      setTotalNormalDuration(route1Dur);
    }

    console.log('Route 1 (Direct) Geometries:', route1Geometries, 'Total Duration:', route1Dur);
    console.log('Route 2 (Alternative) Geometries:', route2Geometries, 'Total Duration:', route2Dur);
    setErrorMessage('');
  };

  // Initialize map and markers
  useEffect(() => {
    if (!isOpen) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
        }],
      },
      center: pickupCoordinates?.coordinates || location.coordinates,
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    map.current.on('load', () => {
      setMapLoaded(true);

      // Route display mode
      if (pickupCoordinates && deliveryCoordinates && transporterCoordinates) {
        // Add markers with names
        if (transporterCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#0000FF' })
            .setLngLat(transporterCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText(`Transporter: ${transporterName || 'Unknown Transporter'}`))
            .addTo(map.current);
        }

        if (pickupCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#FF0000' })
            .setLngLat(pickupCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText(`Donor: ${donorName || 'Unknown Donor'}`))
            .addTo(map.current);
        }

        if (deliveryCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#00FF00' })
            .setLngLat(deliveryCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText(`Recipient: ${recipientName || 'Unknown Recipient'}`))
            .addTo(map.current);
        }

        // Trigger route calculation
        calculateRoutes();
      } else {
        // Location picking mode
        marker.current = new maplibregl.Marker({ draggable: true, color: '#FF0000' })
          .setLngLat(location.coordinates)
          .addTo(map.current);

        marker.current.on('dragend', () => {
          const { lng, lat } = marker.current.getLngLat();
          updateLocation(lng, lat);
        });

        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          marker.current.setLngLat([lng, lat]);
          updateLocation(lng, lat);
        });

        if (!address && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => updateLocation(coords.longitude, coords.latitude, true),
            () => alert('Geolocation failed. Defaulting to Soukra, Tunis.')
          );
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isOpen, pickupCoordinates, deliveryCoordinates, transporterCoordinates, donorName, recipientName, transporterName]);

  // Draw routes after routes are calculated and map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) {
      console.log('Map not loaded yet, skipping route drawing.');
      return;
    }

    console.log('Drawing routes - Normal Route:', normalRoute);
    console.log('Drawing routes - Optimized Route:', optimizedRoute);

    // Remove existing route layers to prevent duplicates
    for (let i = 0; i < 2; i++) {
      const normalLayerId = `normal-route-layer-${i}`;
      const normalSourceId = `normal-route-${i}`;
      const optimizedLayerId = `optimized-route-layer-${i}`;
      const optimizedSourceId = `optimized-route-${i}`;

      if (map.current.getLayer(normalLayerId)) {
        map.current.removeLayer(normalLayerId);
      }
      if (map.current.getSource(normalSourceId)) {
        map.current.removeSource(normalSourceId);
      }
      if (map.current.getLayer(optimizedLayerId)) {
        map.current.removeLayer(optimizedLayerId);
      }
      if (map.current.getSource(optimizedSourceId)) {
        map.current.removeSource(optimizedSourceId);
      }
    }

    // Draw Normal Route (Solid Line)
    if (normalRoute && normalRoute.geometries && normalRoute.geometries.length > 0) {
      normalRoute.geometries.forEach((segment, index) => {
        console.log(`Drawing normal route segment ${index}:`, segment);
        const sourceId = `normal-route-${index}`;
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: segment.geometry,
            },
          });
        } else {
          map.current.getSource(sourceId).setData({
            type: 'Feature',
            properties: {},
            geometry: segment.geometry,
          });
        }

        const layerId = `normal-route-layer-${index}`;
        if (!map.current.getLayer(layerId)) {
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': index === 0 ? '#0000FF' : '#00FF00', // Blue for Transporter -> Donor, Green for Donor -> Recipient
              'line-width': 4,
              'line-opacity': 0.7,
            },
          });
        }
      });
    } else {
      console.log('No normal route geometries to draw.');
    }

    // Draw Optimized Route (Dotted Line)
    if (optimizedRoute && optimizedRoute.geometries && optimizedRoute.geometries.length > 0) {
      optimizedRoute.geometries.forEach((segment, index) => {
        console.log(`Drawing optimized route segment ${index}:`, segment);
        const sourceId = `optimized-route-${index}`;
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: segment.geometry,
            },
          });
        } else {
          map.current.getSource(sourceId).setData({
            type: 'Feature',
            properties: {},
            geometry: segment.geometry,
          });
        }

        const layerId = `optimized-route-layer-${index}`;
        if (!map.current.getLayer(layerId)) {
          map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': index === 0 ? '#0000FF' : '#00FF00',
              'line-width': 4,
              'line-opacity': 0.7,
              'line-dasharray': [2, 2],
              'line-offset': 2,
            },
          });
        }
      });
    } else {
      console.log('No optimized route geometries to draw.');
    }

    // Fit map to bounds
    const coordinates = [
      transporterCoordinates?.coordinates,
      pickupCoordinates?.coordinates,
      deliveryCoordinates?.coordinates,
    ].filter(coord => coord && coord[0] !== 0 && coord[1] !== 0);

    if (coordinates.length > 1) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (coordinates.length === 1) {
      map.current.flyTo({ center: coordinates[0], zoom: 15 });
    }
  }, [mapLoaded, optimizedRoute, normalRoute, transporterCoordinates, pickupCoordinates, deliveryCoordinates]);

  const updateLocation = async (lng, lat, move = false) => {
    const newLoc = { type: 'Point', coordinates: [lng, lat] };
    setLocation(newLoc);
    onLocationChange(newLoc);

    const addr = await reverseGeocode(lng, lat);
    setAddress(addr);
    onAddressChange(addr);

    if (move) map.current?.flyTo({ center: [lng, lat], zoom: 15 });
  };

  const geocodeAddress = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'SustainaFood/1.0 (contact@example.com)',
        },
      });
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const lng = parseFloat(lon);
        const latNum = parseFloat(lat);
        marker.current?.setLngLat([lng, latNum]);
        map.current?.flyTo({ center: [lng, latNum], zoom: 15 });
        updateLocation(lng, latNum);
      } else {
        alert('Adresse introuvable.');
      }
    } catch (err) {
      alert('Échec de la géolocalisation par adresse.');
    }
  };

  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}`, {
        headers: {
          'User-Agent': 'SustainaFood/1.0 (contact@example.com)',
        },
      });
      const data = await res.json();
      return data.display_name || 'Lieu inconnu';
    } catch {
      return 'Lieu inconnu';
    }
  };

  return isOpen ? (
    <div className="location-picker-localisation">
      {/* Route info panel for route display mode */}
      {pickupCoordinates && deliveryCoordinates && transporterCoordinates && (
        <RouteInfoPanel>
          {errorMessage ? (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          ) : optimizedRoute && optimizedRoute.geometries.length > 0 && normalRoute && normalRoute.geometries.length > 0 ? (
            <>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Trajet normal (Ligne continue)</p>
              {normalRoute.geometries.map((segment, index) => (
                <RouteLabel key={`normal-${index}`}>
                  <RouteColor style={{ backgroundColor: index === 0 ? '#0000FF' : '#00FF00' }} />
                  {segment.from} vers {segment.to} ({formatDuration(segment.duration)})
                </RouteLabel>
              ))}
              <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
                Durée totale (normal): {formatDuration(totalNormalDuration)}
              </p>
              <p style={{ fontWeight: 'bold', marginTop: '10px', marginBottom: '5px' }}>Trajet optimisé (Pointillé)</p>
              {optimizedRoute.geometries.map((segment, index) => (
                <RouteLabel key={`optimized-${index}`}>
                  <RouteColor style={{ backgroundColor: index === 0 ? '#0000FF' : '#00FF00' }} />
                  {segment.from} vers {segment.to} ({formatDuration(segment.duration)})
                </RouteLabel>
              ))}
              <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
                Durée totale (optimisé): {formatDuration(totalOptimizedDuration)}
              </p>
            </>
          ) : (
            <ErrorMessage>Échec du calcul des trajets. Vérifiez les coordonnées.</ErrorMessage>
          )}
        </RouteInfoPanel>
      )}
      {/* Address search in location picking mode */}
      {!(pickupCoordinates && deliveryCoordinates && transporterCoordinates) && (
        <div className="address-search-localisation">
          <input
            className="signup-input-localisation"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Entrer une adresse"
          />
          <button className="search-button-localisation" onClick={() => geocodeAddress(address)}>Rechercher</button>
          <button
            className="geolocation-button-localisation"
            onClick={() => navigator.geolocation.getCurrentPosition(
              ({ coords }) => updateLocation(coords.longitude, coords.latitude, true),
              () => alert('Échec de la géolocalisation.')
            )}
          >
            📍
          </button>
        </div>
      )}
      <div ref={mapContainer} className="map-container-localisation" />
      <div className="location-picker-buttons-localisation">
        <button className="confirm-button-localisation" onClick={() => onSelect(location, address)}>Confirmer</button>
        <button className="cancel-button-localisation" onClick={onClose}>Annuler</button>
      </div>
    </div>
  ) : null;
};

export default DeleveryMap;