import React, { useState, useEffect } from 'react';

const BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3001": "https://hyttamiapi.netlify.app"; 

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(BASE_URL + '/api/weather');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{"Raudbergvegen 47<333"}</h1>
      <h2>Værmelding!!</h2>
      <ul>
        {weatherData.map((entry, index) => (
          <text key={index}>
            <p><strong>Klokkeslett:</strong> {new Date(entry.time).toLocaleString()}</p>
            <p><strong>Temperatur:</strong> {entry.air_temperature}°C</p>
            <p><strong>Vindretning:</strong> {entry.wind_from_direction}°</p> 
            <p><strong>Vindstyrke:</strong> {entry.wind_speed} m/s</p>
            <hr />
          </text>
        ))}
      </ul>
    </div>
  );
};

export default Weather;
