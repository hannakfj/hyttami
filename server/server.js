const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

const apiUrl = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.78&lon=7.33&altitude=90';

async function fetchWeatherData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'HyttaMi/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Failed to fetch weather data: ' + error.message);
    }
}

app.get('/api/weather', async (req, res) => {
    try {
        const weatherData = await fetchWeatherData();
        const processedData = weatherData.properties.timeseries.map(entry => ({
            time: entry.time,
            air_temperature: entry.data.instant.details.air_temperature,
            wind_from_direction: entry.data.instant.details.wind_from_direction,
            wind_speed: entry.data.instant.details.wind_speed
        }));
        res.json(processedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
