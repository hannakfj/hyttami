const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables

const app = express();

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3001;

// MongoDB connection and GridFS bucket setup
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware setup
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Weather Data Fetching Function
const apiUrlYr = process.env.WEATHER_API_URL;
const userAgent = process.env.WEATHER_API_USER_AGENT || 'HyttaMi/1.0';

async function fetchWeatherData() {
  try {
    const response = await fetch(apiUrlYr, {
      headers: { 'User-Agent': userAgent },
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
      wind_speed: entry.data.instant.details.wind_speed,
    }));
    res.json(processedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// // Start the server locally or export for serverless deployment
// app.listen(port, () => {
//   console.log(`Server listening on Port ${port}`);
// });

module.exports.handler = serverless(app);
