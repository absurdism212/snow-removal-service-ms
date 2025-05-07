import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  CircularProgress,
  Chip
} from '@mui/material';

// Replace with your Google Maps API key
const GOOGLE_MAPS_API_KEY = 'your_google_maps_api_key';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 42.3601, // Boston coordinates as default
  lng: -71.0589
};

function MapView() {
  const [crews, setCrews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch crew locations
        const crewsQuery = query(collection(db, 'users'), where('role', '==', 'crew'));
        const crewsSnapshot = await getDocs(crewsQuery);
        const crewsList = crewsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(crew => crew.lastLocation); // Only include crews with location data
        
        setCrews(crewsList);
        
        // Fetch pending and in-progress jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', 'in', ['pending', 'in-progress'])
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        
        // In a real app, you would geocode addresses to get coordinates
        // For demo purposes, we'll assign random coordinates near the default center
        const jobsList = jobsSnapshot.docs.map(doc => {
          const job = doc.data();
          return {
            id: doc.id,
            ...job,
            // Generate random coordinates near default center for demo
            location: {
              latitude: defaultCenter.lat + (Math.random() - 0.5) * 0.1,
              longitude: defaultCenter.lng + (Math.random() - 0.5) * 0.1
            }
          };
        });
        
        setJobs(jobsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching map data:', error);
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCrewClick = (crew) => {
    setSelectedCrew(crew);
    setSelectedJob(null);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setSelectedCrew(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5">Live Map</Typography>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={11}
          >
            {/* Crew Markers */}
            {crews.map(crew => (
              <Marker
                key={`crew-${crew.id}`}
                position={{
                  lat: crew.lastLocation.latitude,
                  lng: crew.lastLocation.longitude
                }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
                onClick={() => handleCrewClick(crew)}
              />
            ))}
            
            {/* Job Markers */}
            {jobs.map(job => (
              <Marker
                key={`job-${job.id}`}
                position={{
                  lat: job.location.latitude,
                  lng: job.location.longitude
                }}
                icon={{
                  url: job.status === 'in-progress' 
                    ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
                onClick={() => handleJobClick(job)}
              />
            ))}
            
            {/* Info Windows */}
            {selectedCrew && (
              <InfoWindow
                position={{
                  lat: selectedCrew.lastLocation.latitude,
                  lng: selectedCrew.lastLocation.longitude
                }}
                onCloseClick={() => setSelectedCrew(null)}
              >
                <div>
                  <Typography variant="subtitle1">{selectedCrew.name}</Typography>
                  <Typography variant="body2">
                    Last updated: {new Date(selectedCrew.lastLocation.timestamp.seconds * 1000).toLocaleString()}
                  </Typography>
                </div>
              </InfoWindow>
            )}
            
            {selectedJob && (
              <InfoWindow
                position={{
                  lat: selectedJob.location.latitude,
                  lng: selectedJob.location.longitude
                }}
                onCloseClick={() => setSelectedJob(null)}
              >
                <div>
                  <Typography variant="subtitle1">{selectedJob.address}</Typography>
                  <Typography variant="body2">
                    Status: {selectedJob.status}
                  </Typography>
                  {selectedJob.assignedTo && (
                    <Typography variant="body2">
                      Assigned to: {crews.find(c => c.id === selectedJob.assignedTo)?.name || 'Unknown crew member'}
                    </Typography>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            icon={<span style={{ 
              background: 'blue', 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              display: 'inline-block',
              marginRight: 5
            }}></span>} 
            label="Crew Member" 
          />
          <Chip 
            icon={<span style={{ 
              background: 'red', 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              display: 'inline-block',
              marginRight: 5
            }}></span>} 
            label="Pending Job" 
          />
          <Chip 
            icon={<span style={{ 
              background: 'green', 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              display: 'inline-block',
              marginRight: 5
            }}></span>} 
            label="In Progress Job" 
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default MapView;