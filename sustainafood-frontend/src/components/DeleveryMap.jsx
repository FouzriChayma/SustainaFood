import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../assets/styles/LocationPicker.css';

const DeleveryMap = ({
  isOpen,
  onClose,
  onLocationChange,
  onAddressChange,
  onSelect,
  initialAddress,
  routeInfo, // Added for route display
  pickupCoordinates, // Added for pickup marker
  deliveryCoordinates, // Added for delivery marker
  transporterCoordinates, // Added for transporter marker
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [location, setLocation] = useState({ type: 'Point', coordinates: [10.1658, 36.8188] });
  const [address, setAddress] = useState(initialAddress || '');

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
      // Route display mode (used in AssignedDeliveries)
      if (routeInfo && pickupCoordinates && deliveryCoordinates && transporterCoordinates) {
        // Add markers
        if (transporterCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#0000FF' })
            .setLngLat(transporterCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText('Transporter Location'))
            .addTo(map.current);
        }

        if (pickupCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#FF0000' })
            .setLngLat(pickupCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText('Pickup Location'))
            .addTo(map.current);
        }

        if (deliveryCoordinates.coordinates[0] !== 0) {
          new maplibregl.Marker({ color: '#00FF00' })
            .setLngLat(deliveryCoordinates.coordinates)
            .setPopup(new maplibregl.Popup().setText('Delivery Location'))
            .addTo(map.current);
        }

        // Add routes if no error
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
            () => alert('Geolocation failed. Defaulting to Tunis.')
          );
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [isOpen, routeInfo, pickupCoordinates, deliveryCoordinates, transporterCoordinates]);

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
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
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
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${lng}&lat=${lat}`);
      const data = await res.json();
      return data.display_name || 'Lieu inconnu';
    } catch {
      return 'Lieu inconnu';
    }
  };

  return isOpen ? (
    <div className="location-picker-localisation">
      {/* Hide address search in route display mode */}
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