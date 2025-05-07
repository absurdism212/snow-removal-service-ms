import axios from 'axios';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// In a production app, you would use a real weather API like OpenWeatherMap
// This is a simplified mock version for demonstration
const API_KEY = 'your_openweathermap_api_key'; // Get from openweathermap.org

// List of cities to monitor
const monitoredCities = [
  { name: 'City 1', lat: 42.3601, lon: -71.0589 },
  { name: 'City 2', lat: 41.8781, lon: -87.6298 },
  { name: 'City 3', lat: 40.7128, lon: -74.0060 },
  { name: 'City 4', lat: 39.9526, lon: -75.1652 },
  { name: 'City 5', lat: 47.6062, lon: -122.3321 },
  { name: 'City 6', lat: 37.7749, lon: -122.4194 },
  { name: 'City 7', lat: 34.0522, lon: -118.2437 },
  { name: 'City 8', lat: 25.7617, lon: -80.1918 },
];

// Get current weather for all monitored cities
export const getWeatherForAllCities = async () => {
  try {
    // For demo purposes, we'll use mock data
    // In a real app, you would fetch from OpenWeatherMap API

    const mockWeatherData = monitoredCities.map(city => ({
      city: city.name,
      // Generate random snowfall between 0 and 8 inches
      snowfall: Math.round(Math.random() * 8 * 10) / 10,
      temperature: Math.round(20 + Math.random() * 15),
      date: new Date()
    }));

    return mockWeatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Check weather thresholds and create jobs as needed
export const checkWeatherAndCreateJobs = async () => {
  try {
    const weatherData = await getWeatherForAllCities();
    const results = { created: 0, skipped: 0, errors: 0 };
    
    for (const cityWeather of weatherData) {
      if (cityWeather.snowfall > 0) {
        // Get contracts for this city with thresholds exceeded
        const contractsQuery = query(
          collection(db, 'contracts'),
          where('city', '==', cityWeather.city),
          where('snowThreshold', '<=', cityWeather.snowfall)
        );
        
        const contractsSnapshot = await getDocs(contractsQuery);
        
        for (const contractDoc of contractsSnapshot.docs) {
          const contract = contractDoc.data();
          
          // Check if job already exists for this contract today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const existingJobsQuery = query(
            collection(db, 'jobs'),
            where('contractId', '==', contractDoc.id),
            where('createdAt', '>=', today),
            where('createdAt', '<', tomorrow)
          );
          
          const existingJobs = await getDocs(existingJobsQuery);
          
          if (existingJobs.empty) {
            // Create a new job
            try {
              await addDoc(collection(db, 'jobs'), {
                contractId: contractDoc.id,
                customerId: contract.customerId,
                address: `${contract.address}, ${contract.city}`,
                scheduledDate: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                status: 'pending',
                snowfall: cityWeather.snowfall,
                isPriority: contract.isPriority || false,
                notes: `Automatically created due to ${cityWeather.snowfall}" snowfall exceeding threshold of ${contract.snowThreshold}"`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              
              results.created++;
            } catch (error) {
              console.error('Error creating job:', error);
              results.errors++;
            }
          } else {
            results.skipped++;
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in weather check:', error);
    throw error;
  }
};
