import React, { useState, useEffect } from 'react';
import { getWeatherForAllCities, checkWeatherAndCreateJobs } from '../services/weatherService';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

function WeatherAdmin() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobResult, setJobResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherForAllCities();
      setWeatherData(data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createJobsFromWeather = async () => {
    setLoading(true);
    setError(null);
    setJobResult(null);
    try {
      const result = await checkWeatherAndCreateJobs();
      setJobResult(result);
    } catch (err) {
      setError('Failed to create jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Weather Management</Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={fetchWeatherData} 
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Refresh Weather
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={createJobsFromWeather}
            disabled={loading}
          >
            Create Jobs from Weather
          </Button>
        </Box>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {jobResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Job creation completed: {jobResult.created} jobs created, {jobResult.skipped} skipped, {jobResult.errors} errors.
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>City</TableCell>
              <TableCell>Current Snowfall</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weatherData.map((data) => (
              <TableRow key={data.city}>
                <TableCell>{data.city}</TableCell>
                <TableCell>{data.snowfall}" of snow</TableCell>
                <TableCell>{data.temperature}°F</TableCell>
                <TableCell>{data.date.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {weatherData.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No weather data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default WeatherAdmin;