import React, { useState, useEffect } from 'react';
import { updateTransporterAvailability, updateTransporterLocation } from '../api/userService';
import LocationPicker from '../components/LocationPicker';
import '../assets/styles/TransporterProfile.css';

const TransporterProfile = ({ user }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = loggedInUser && (loggedInUser._id === user?._id || loggedInUser.id === user?.id);
  const userid = user?._id || user?.id;
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable !== undefined ? user.isAvailable : true);
  const [location, setLocation] = useState(user?.location || { type: 'Point', coordinates: [0, 0] });
  const [address, setAddress] = useState(user?.address || '');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    if (user?.isAvailable !== undefined) {
      setIsAvailable(user.isAvailable);
    }
    if (user?.location) {
      setLocation(user.location);
      setAddress(user.address || `Lat: ${user.location.coordinates[1].toFixed(6)}, Lon: ${user.location.coordinates[0].toFixed(6)}`);
    }
  }, [user]);

  const handleLocationSelect = async (selectedLocation, selectedAddress) => {
    if (!userid) {
      setError('User ID is missing');
      return;
    }

    try {
      setLocation(selectedLocation);
      setAddress(selectedAddress);
      setIsMapOpen(false);
      setError(null);

      await updateTransporterLocation(userid, {
        location: selectedLocation,
        address: selectedAddress,
      });
    } catch (err) {
      setError(err.message || 'Failed to update location');
      console.error('Location update error:', err);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!userid) {
      setError('User ID is missing');
      return;
    }

    try {
      setLoading(true);
      const newAvailability = !isAvailable;
      await updateTransporterAvailability(userid, newAvailability);
      setIsAvailable(newAvailability);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update availability');
      console.error('Availability update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'transporter') {
    return <p className="error-message">Access denied. This page is for transporters only.</p>;
  }

  return (
    <div className="transporter-profile">
      <h3>Transporter Dashboard</h3>
      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Updating...</p>}

      <div className="transporter-card">
        <h4>Availability Status</h4>
        <p><strong>Status:</strong> {isAvailable ? 'Available' : 'Unavailable'}</p>
        {isOwnProfile && (
          <button
            className={`availability-btn ${isAvailable ? 'available' : 'unavailable'}`}
            onClick={handleAvailabilityToggle}
            disabled={loading}
          >
            {isAvailable ? 'Set Unavailable' : 'Set Available'}
          </button>
        )}
      </div>

      <div className="transporter-card">
        <h4>Current Location</h4>
        <div>
          <label>📍 Location</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onClick={() => isOwnProfile && setIsMapOpen(true)}
            placeholder="📍 Select Location"
            readOnly
          />
          {isMapOpen && isOwnProfile && (
            <LocationPicker
              isOpen={isMapOpen}
              onClose={() => setIsMapOpen(false)}
              onLocationChange={setLocation}
              onAddressChange={setAddress}
              onSelect={handleLocationSelect}
              initialAddress={address}
            />
          )}
        </div>
        {location.coordinates[0] !== 0 && location.coordinates[1] !== 0 ? (
          <>
            <p><strong>Latitude:</strong> {location.coordinates[1].toFixed(6)}</p>
            <p><strong>Longitude:</strong> {location.coordinates[0].toFixed(6)}</p>
            <div className="map-placeholder">
              <p>Map display coming soon...</p>
            </div>
          </>
        ) : (
          <p>{isOwnProfile ? 'Select a location...' : 'Location not set'}</p>
        )}
      </div>
    </div>
  );
};

export default TransporterProfile;