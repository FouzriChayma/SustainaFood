import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../assets/styles/LocationPicker.css';
import styled from 'styled-components';
import { IoClose } from 'react-icons/io5';
import { FaArrowRight } from 'react-icons/fa';

const RouteInfoPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  color: #333;
  z-index: 1000;
  max-width: 320px;
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

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: background 0.3s;

  &:hover {
    background: #d9363e;
  }
`;

const DeliveryMap = ({
  isOpen,
  onClose,
  pickupCoordinates,
  deliveryCoordinates,
  transporterCoordinates,
  donorName,
  recipientName,
  transporterName,
  vehicleType = 'Car', // Default to 'Car' if not provided
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const transporterMarker = useRef(null);
  const transporterPinMarker = useRef(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [totalOptimizedDuration, setTotalOptimizedDuration] = useState(0);
  const [totalAIPredictedDuration, setTotalAIPredictedDuration] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTransporterLocation, setCurrentTransporterLocation] = useState(transporterCoordinates);

  // Format duration in seconds to a readable string
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      console.warn('Invalid duration:', seconds);
      return 'Unknown';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes} min`;
    return `${secs} sec`;
  };

  // Format distance in kilometers to a readable string
  const formatDistance = (km) => {
    if (!km || isNaN(km) || km < 0) {
      console.warn('Invalid distance:', km);
      return 'Unknown';
    }
    return `${km.toFixed(2)} km`;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance / 1000; // Convert to kilometers
  };

  // Fetch AI-predicted duration from Flask backend
  const fetchAIPredictedDuration = async (distance, osrmDuration, hour, weather = 'Clear', vehicleType) => {
    console.log('Fetching AI-predicted duration with:', { distance, osrmDuration, hour, weather, vehicleType });
    try {
      const response = await fetch('http://localhost:5000/predict_duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distance,
          osrmDuration,
          hour,
          weather,
          vehicleType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI prediction request failed:', errorData);
        return null;
      }

      const data = await response.json();
      console.log('AI Prediction Response:', data);
      return data.predictedDuration;
    } catch (error) {
      console.error('Error fetching AI-predicted duration:', error);
      return null;
    }
  };

  // Fetch route data using OSRM API
  const fetchRoute = async (coordinates) => {
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
      if (data.routes && data.routes.length > 0) {
        return {
          geometry: data.routes[0].geometry,
          duration: data.routes[0].duration,
          distance: data.routes[0].distance / 1000, // Convert meters to kilometers
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

  // Calculate routes and AI predictions
  const calculateRoutes = async (transporterLoc) => {
    if (!transporterLoc || !pickupCoordinates || !deliveryCoordinates) {
      setErrorMessage('Missing coordinates for one or more points (Transporter, Donor, Recipient).');
      return;
    }

    const points = [
      { name: 'transporter', coords: transporterLoc.coordinates, label: transporterName || 'Transporter' },
      { name: 'pickup', coords: pickupCoordinates.coordinates, label: donorName || 'Donor' },
      { name: 'delivery', coords: deliveryCoordinates.coordinates, label: recipientName || 'Recipient' },
    ].filter(point => point.coords && point.coords[0] !== 0 && point.coords[1] !== 0);

    if (points.length < 3) {
      setErrorMessage(`Insufficient valid coordinates. Found ${points.length}/3 valid points.`);
      return;
    }

    const transporter = points.find(p => p.name === 'transporter');
    const donor = points.find(p => p.name === 'pickup');
    const recipient = points.find(p => p.name === 'delivery');

    const routeGeometries = [];
    let totalOsrmDuration = 0;
    let totalAIPredictedDuration = 0;
    let totalDist = 0;

    // Transporter to Donor
    let transporterToDonor = await fetchRoute([transporter.coords, donor.coords]);
    if (transporterToDonor) {
      const osrmDuration = transporterToDonor.duration;
      const distance = transporterToDonor.distance;
      const hour = new Date().getHours();
      const aiDuration = await fetchAIPredictedDuration(distance, osrmDuration, hour, 'Clear', vehicleType);
      console.log('Transporter to Donor - AI Duration:', aiDuration);

      routeGeometries.push({
        from: transporter.label,
        to: donor.label,
        geometry: transporterToDonor.geometry,
        osrmDuration,
        aiDuration: aiDuration !== null ? aiDuration : null,
        distance,
      });
      totalOsrmDuration += osrmDuration;
      if (aiDuration !== null) totalAIPredictedDuration += aiDuration;
      totalDist += distance;
    } else {
      setErrorMessage('Failed to fetch route from Transporter to Donor.');
      return;
    }

    // Donor to Recipient
    let donorToRecipient = await fetchRoute([donor.coords, recipient.coords]);
    if (donorToRecipient) {
      const osrmDuration = donorToRecipient.duration;
      const distance = donorToRecipient.distance;
      const hour = new Date().getHours();
      const aiDuration = await fetchAIPredictedDuration(distance, osrmDuration, hour, 'Clear', vehicleType);
      console.log('Donor to Recipient - AI Duration:', aiDuration);

      routeGeometries.push({
        from: donor.label,
        to: recipient.label,
        geometry: donorToRecipient.geometry,
        osrmDuration,
        aiDuration: aiDuration !== null ? aiDuration : null,
        distance,
      });
      totalOsrmDuration += osrmDuration;
      if (aiDuration !== null) totalAIPredictedDuration += aiDuration;
      totalDist += distance;
    } else {
      setErrorMessage('Failed to fetch route from Donor to Recipient.');
      return;
    }

    console.log('Total AI Predicted Duration before setting:', totalAIPredictedDuration);
    console.log('Total Distance before setting:', totalDist);
    setOptimizedRoute({ geometries: routeGeometries });
    setTotalOptimizedDuration(totalOsrmDuration);
    setTotalAIPredictedDuration(totalAIPredictedDuration);
    setTotalDistance(totalDist);
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
      center: currentTransporterLocation?.coordinates || pickupCoordinates?.coordinates || [10.208, 36.860],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl());

    map.current.on('load', () => {
      setMapLoaded(true);

      if (pickupCoordinates && deliveryCoordinates && currentTransporterLocation) {
        // Transporter marker (arrow)
        const transporterEl = document.createElement('div');
        transporterEl.className = 'transporter-marker';
        transporterEl.style.width = '30px';
        transporterEl.style.height = '30px';
        transporterEl.style.display = 'flex';
        transporterEl.style.alignItems = 'center';
        transporterEl.style.justifyContent = 'center';
        transporterEl.style.color = '#0000FF';
        transporterEl.style.fontSize = '24px';
        transporterEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>';

        if (currentTransporterLocation.coordinates[0] !== 0) {
          transporterMarker.current = new maplibregl.Marker({
            element: transporterEl,
          })
            .setLngLat(currentTransporterLocation.coordinates)
            .setPopup(new maplibregl.Popup().setText(`Transporter: ${transporterName || 'Unknown Transporter'}`))
            .addTo(map.current);
        }

        // Transporter pin marker (blue pin like Donor's red pin)
        if (currentTransporterLocation.coordinates[0] !== 0) {
          transporterPinMarker.current = new maplibregl.Marker({ color: '#0000FF' })
            .setLngLat(currentTransporterLocation.coordinates)
            .setPopup(new maplibregl.Popup().setText(`Transporter Position: ${transporterName || 'Unknown Transporter'}`))
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

        calculateRoutes(currentTransporterLocation);
      }
    });

    // Track real-time movement
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const newLocation = { type: 'Point', coordinates: [coords.longitude, coords.latitude] };
        setCurrentTransporterLocation(newLocation);

        if (transporterMarker.current) {
          transporterMarker.current.setLngLat(newLocation.coordinates);
        }
        if (transporterPinMarker.current) {
          transporterPinMarker.current.setLngLat(newLocation.coordinates);
        }

        calculateRoutes(newLocation);

        map.current.flyTo({ center: newLocation.coordinates, zoom: 15 });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorMessage('Failed to track your location.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => {
      if (map.current) {
        map.current.remove();
      }
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOpen, pickupCoordinates, deliveryCoordinates, donorName, recipientName, transporterName, vehicleType]);

  // Draw routes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove existing route layers
    for (let i = 0; i < 2; i++) {
      const optimizedLayerId = `optimized-route-layer-${i}`;
      const optimizedSourceId = `optimized-route-${i}`;

      if (map.current.getLayer(optimizedLayerId)) {
        map.current.removeLayer(optimizedLayerId);
      }
      if (map.current.getSource(optimizedSourceId)) {
        map.current.removeSource(optimizedSourceId);
      }
    }

    if (optimizedRoute && optimizedRoute.geometries && optimizedRoute.geometries.length > 0) {
      optimizedRoute.geometries.forEach((segment, index) => {
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
    }

    const coordinates = [
      currentTransporterLocation?.coordinates,
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
  }, [mapLoaded, optimizedRoute, currentTransporterLocation, pickupCoordinates, deliveryCoordinates]);

  return isOpen ? (
    <div className="location-picker-localisation">
      <CloseButton onClick={onClose} aria-label="Close map">
        <IoClose size={20} />
      </CloseButton>
      {pickupCoordinates && deliveryCoordinates && currentTransporterLocation && (
        <RouteInfoPanel>
          {errorMessage ? (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          ) : optimizedRoute && optimizedRoute.geometries.length > 0 ? (
            <>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Optimized Route (Dashed)</p>
              {optimizedRoute.geometries.map((segment, index) => (
                <div key={`optimized-${index}`}>
                  <RouteLabel>
                    <RouteColor style={{ backgroundColor: index === 0 ? '#0000FF' : '#00FF00' }} />
                    {segment.from} to {segment.to}
                  </RouteLabel>
                  <RouteLabel style={{ marginLeft: '20px' }}>
                    OSRM: {formatDuration(segment.osrmDuration)}
                  </RouteLabel>
                  <RouteLabel style={{ marginLeft: '20px' }}>
                    AI: {segment.aiDuration !== null ? formatDuration(segment.aiDuration) : 'N/A'}
                  </RouteLabel>
                  <RouteLabel style={{ marginLeft: '20px' }}>
                    Distance: {formatDistance(segment.distance)}
                  </RouteLabel>
                </div>
              ))}
              <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                Total OSRM Duration: {formatDuration(totalOptimizedDuration)}
              </p>
              <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
                Total AI-Predicted Duration: {totalAIPredictedDuration > 0 ? formatDuration(totalAIPredictedDuration) : 'N/A'}
              </p>
              <p style={{ fontWeight: 'bold', marginTop: '5px' }}>
                Total Distance: {formatDistance(totalDistance)}
              </p>
            </>
          ) : (
            <ErrorMessage>Failed to calculate routes. Please check coordinates.</ErrorMessage>
          )}
        </RouteInfoPanel>
      )}
      <div ref={mapContainer} className="map-container-localisation" />
    </div>
  ) : null;
};

export default DeliveryMap;