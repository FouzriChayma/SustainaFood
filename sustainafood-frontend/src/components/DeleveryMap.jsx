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
  routeInfo,
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

  // Format duration from seconds to a readable string (e.g., "1h 23m" or "45m")
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      console.warn('Invalid duration:', seconds);
      return 'Unknown';
    }
    console.log('Raw duration (seconds):', seconds); // Debug log
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes} min`;
    return `${secs} sec`;
  };

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
      // Log coordinates for debugging
      console.log('Map loaded with coordinates:', {
        transporter: transporterCoordinates?.coordinates,
        pickup: pickupCoordinates?.coordinates,
        delivery: deliveryCoordinates?.coordinates,
      });

      // Route display mode (used in AssignedDeliveries)
      if (routeInfo && pickupCoordinates && deliveryCoordinates && transporterCoordinates) {
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

        // Add routes with labels
        if (!routeInfo.error) {
          map.current.addSource('to-pickup-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: routeInfo.toPickup.geometry,
            },
          });

          map.current.addLayer({
            id: 'to-pickup-route',
            type: 'line',
            source: 'to-pickup-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#0000FF',
              'line-width': 4,
              'line-opacity': 0.7,
            },
          });

          map.current.addSource('to-delivery-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: routeInfo.toDelivery.geometry,
            },
          });

          map.current.addLayer({
            id: 'to-delivery-route',
            type: 'line',
            source: 'to-delivery-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#00FF00',
              'line-width': 4,
              'line-opacity': 0.7,
            },
          });

          // Fit map to bounds
          const coordinates = [
            transporterCoordinates.coordinates,
            pickupCoordinates.coordinates,
            deliveryCoordinates.coordinates,
          ].filter(coord => coord[0] !== 0 && coord[1] !== 0);
          if (coordinates.length > 1) {
            const bounds = coordinates.reduce((bounds, coord) => {
              return bounds.extend(coord);
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
            map.current.fitBounds(bounds, { padding: 50 });
          } else if (coordinates.length === 1) {
            map.current.flyTo({ center: coordinates[0], zoom: 15 });
          }
        }
      } else {
        // Location picking mode (used in TransporterProfile)
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
  }, [isOpen, routeInfo, pickupCoordinates, deliveryCoordinates, transporterCoordinates, donorName, recipientName, transporterName]);

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
      {routeInfo && (
        <RouteInfoPanel>
          {routeInfo.error ? (
            <ErrorMessage>Échec du calcul des trajets. Vérifiez les coordonnées.</ErrorMessage>
          ) : (
            <>
              <RouteLabel>
                <RouteColor style={{ backgroundColor: '#0000FF' }} />
                Trajet 1: Transporteur vers Donateur ({formatDuration(routeInfo.toPickup?.duration)})
              </RouteLabel>
              <RouteLabel>
                <RouteColor style={{ backgroundColor: '#00FF00' }} />
                Trajet 2: Donateur vers Bénéficiaire ({formatDuration(routeInfo.toDelivery?.duration)})
              </RouteLabel>
            </>
          )}
        </RouteInfoPanel>
      )}
      {/* Address search in location picking mode */}
      {!routeInfo && (
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