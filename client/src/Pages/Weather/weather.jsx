import React, { useState, useEffect } from 'react';
import {Button, Box, Heading, Text, Spinner } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import backgroundImage from '../../assets/background.jpg';
import { useNavigate } from 'react-router-dom';


// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3001": "https://hyttamiapi.netlify.app"; 

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [temperatureChartData, setTemperatureChartData] = useState(null);
  const [precipitationChartData, setPrecipitationChartData] = useState(null);
  const [windSpeedChartData, setWindSpeedChartData] = useState(null);
  const [windDirectionChartData, setWindDirectionChartData] = useState(null);
  const [minTemperature, setMinTemperature] = useState(null); 
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 

    if (!storedUser) {
      navigate('/login'); 
    }
  }, [navigate]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(BASE_URL + '/api/weather');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Filter out the data for the next 12 hours
        const next12Hours = data.slice(0, 12);

        // Prepare data for the charts
        const times = next12Hours.map(entry => new Date(entry.time).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }));
        const temperatures = next12Hours.map(entry => entry.air_temperature);
        const precipitation = next12Hours.map(entry => entry.precipitation || 0);
        const windSpeeds = next12Hours.map(entry => entry.wind_speed);
        const windDirections = next12Hours.map(entry => entry.wind_from_direction);

        // Calculate the minimum temperature
        const minTemp = Math.min(...temperatures);
        setMinTemperature(minTemp);

        // Set temperature chart data
        setTemperatureChartData({
          labels: times,
          datasets: [
            {
              label: 'Temperatur (°C)',
              data: temperatures,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.4, // smooth curves
            }
          ]
        });

        // Set precipitation chart data
        setPrecipitationChartData({
          labels: times,
          datasets: [
            {
              label: 'Nedbør (mm)',
              data: precipitation,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
              tension: 0.4, // smooth curves
            }
          ]
        });

        // Set wind speed chart data
        setWindSpeedChartData({
          labels: times,
          datasets: [
            {
              label: 'Vindstyrke (m/s)',
              data: windSpeeds,
              borderColor: 'rgba(255, 159, 64, 1)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              fill: true,
              tension: 0.4, // smooth curves
            }
          ]
        });

        // Set wind direction chart data
        setWindDirectionChartData({
          labels: times,
          datasets: [
            {
              label: 'Vindretning (°)',
              data: windDirections,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: true,
              tension: 0.4, // smooth curves
            }
          ]
        });

        setWeatherData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="xl" />
        <Text mt={4}>Laster værmelding...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box
    bg="white" 
    backgroundImage={`url(${backgroundImage})`} 
    backgroundSize="cover" 
    backgroundPosition="bottom" 
    backgroundRepeat="no-repeat"
    textAlign="center"
    p={8}
    display="flex" 
    flexDirection="column" 
    justifyContent="center"
    alignItems="center">
        <Box position="absolute" top={4} right={4}>
            <Button color='white' mb={6} bgColor="orange.400" onClick={() => navigate('/')}>
            Tilbake
            </Button>
        </Box>

    <Box maxW="xl" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg" bgColor='white'>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Raudbergvegen 47
      </Heading>
      <Heading as="h2" size="md" mb={4} textAlign="center" color="gray.600">
        Værmelding de neste 12 timene
      </Heading>

      {/* Conditionally show ski message if minimum temperature is above 0
      {minTemperature > 0 && (
        <Box mb={6} textAlign="center" color="red.500">
          <Text>Ikke mulig å stå på ski i dag, temperaturen er over 0°C</Text>
        </Box>
      )} */}

      {/* Display temperature chart */}
      {temperatureChartData && (
        <Box mt={6}>
          <Heading as="h3" size="sm" mb={2} textAlign="center">
            Temperatur
          </Heading>
          <Line data={temperatureChartData} />
        </Box>
      )}

      {/* Display precipitation chart */}
      {precipitationChartData && (
        <Box mt={10}>
          <Heading as="h3" size="sm" mb={2} textAlign="center">
            Nedbørsmengde
          </Heading>
          <Line data={precipitationChartData} />
        </Box>
      )}

      {/* Display wind speed chart */}
      {windSpeedChartData && (
        <Box mt={10}>
          <Heading as="h3" size="sm" mb={2} textAlign="center">
            Vindstyrke
          </Heading>
          <Line data={windSpeedChartData} />
        </Box>
      )}
      {/*   Try to change this to use icons that displays the direction */}
      {/* {windDirectionChartData && (
        <Box mt={10}>
          <Heading as="h3" size="sm" mb={2} textAlign="center">
            Vindretning
          </Heading>
          <Line data={windDirectionChartData} />
        </Box>
      )} */}

      <Text mt={6} textAlign="center">
        Viser temperatur, nedbør, vindstyrke og vindretning de neste 12 timene.
      </Text>
    </Box>
    </Box>
  );
};

export default Weather;
