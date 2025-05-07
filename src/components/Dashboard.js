import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  Button 
} from '@mui/material';

function Dashboard({ user, userRole }) {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  useEffect(() => {
    // Fetch different data based on user role
    const fetchData = async () => {
      if (userRole === 'admin') {
        // Fetch pending jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'pending'),
          orderBy('scheduledDate')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsList);

        // Fetch customer count
        const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
        const customersSnapshot = await getDocs(customersQuery);
        setCustomers(customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } else if (userRole === 'crew') {
        // Fetch assigned jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('assignedTo', '==', user.uid),
          orderBy('scheduledDate')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsList);
      } else if (userRole === 'customer') {
        // Fetch customer's jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('customerId', '==', user.uid),
          orderBy('scheduledDate')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsList);
      }

      // Mock weather alerts (in a real app, this would come from a weather API)
      setWeatherAlerts([
        { city: 'City 1', snowfall: '3.5 inches', date: new Date().toLocaleDateString() },
        { city: 'City 2', snowfall: '5.2 inches', date: new Date().toLocaleDateString() }
      ]);
    };

    fetchData();
  }, [user, userRole]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.displayName || 'User'}!
            </Typography>
            <Typography variant="body1">
              {userRole === 'admin' && 'Manage your snow removal operations.'}
              {userRole === 'crew' && 'View and complete your assigned jobs.'}
              {userRole === 'customer' && 'Track your snow removal services.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Weather Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Weather Alerts
            </Typography>
            <List>
              {weatherAlerts.map((alert, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${alert.city}: ${alert.snowfall} of snow`}
                      secondary={`Reported on: ${alert.date}`}
                    />
                  </ListItem>
                  {index < weatherAlerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Jobs/Tasks Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {userRole === 'admin' && 'Pending Jobs'}
              {userRole === 'crew' && 'Your Assigned Jobs'}
              {userRole === 'customer' && 'Your Services'}
            </Typography>
            {jobs.length > 0 ? (
              <List>
                {jobs.slice(0, 5).map((job, index) => (
                  <React.Fragment key={job.id}>
                    <ListItem>
                      <ListItemText
                        primary={job.address || 'Location not specified'}
                        secondary={`Status: ${job.status} | Scheduled: ${job.scheduledDate?.toDate?.().toLocaleDateString() || 'Not scheduled'}`}
                      />
                    </ListItem>
                    {index < jobs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2">No jobs to display.</Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary">
                {userRole === 'admin' && 'Manage All Jobs'}
                {userRole === 'crew' && 'View All Jobs'}
                {userRole === 'customer' && 'View All Services'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Admin Stats */}
        {userRole === 'admin' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">{customers.length}</Typography>
                  <Typography variant="body1" align="center">Customers</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">{jobs.length}</Typography>
                  <Typography variant="body1" align="center">Pending Jobs</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" align="center">8</Typography>
                  <Typography variant="body1" align="center">Cities Served</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Dashboard;