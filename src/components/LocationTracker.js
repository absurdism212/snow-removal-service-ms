import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormControlLabel,
  Alert
} from '@mui/material';

function LocationTracker() {
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const toggleTracking = () => {
    if (!tracking) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null);
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Update location in Firestore
        updateLocationInFirestore(latitude, longitude);
        
        setTracking(true);
      },
      (err) => {
        setError(`Error: ${err.message}`);
        setTracking(false);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 10000, 
        timeout: 5000 
      }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setTracking(false);
    }
  };

  const updateLocationInFirestore = async (latitude, longitude) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      await updateDoc(doc(db, 'users', userId), {
        lastLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Location Tracking</Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={tracking}
            onChange={toggleTracking}
            color="primary"
          />
        }
        label={tracking ? "Tracking On" : "Tracking Off"}
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      
      {tracking && location && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Current Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Location updates are being sent automatically.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default LocationTracker;