const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path'); // Add path module
require('dotenv').config({ path: '../.env' });

const app = express();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let conn;
let gfs;
let upload;

const connectToDatabase = async () => {
  if (!conn) {
    conn = mongoose.createConnection(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    conn.once('open', () => {
      gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

      const storage = new GridFsStorage({
        db: conn.db,
        file: (req, file) => {
          return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) return reject(err);
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

      upload = multer({ storage });
      console.log('MongoDB connection established and GridFS storage engine ready.');
    });
  }
};

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const checkInSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const checkOutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const shoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const tripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, enum: ['Langrenn', 'Rando', 'Løpetur', 'Fottur'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  description: { type: String, required: true },
  image: { type: String },
});

const CheckInItem = mongoose.model('CheckInItem', checkInSchema);
const CheckOutItem = mongoose.model('CheckOutItem', checkOutSchema);
const ShoppingItem = mongoose.model('ShoppingItem', shoppingListSchema);
const User = mongoose.model('User', userSchema);
const Trip = mongoose.model('Trip', tripSchema);

// User Authentication Routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: `Welcome ${user.username}`, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/add-user', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Trip Routes
app.post('/add-trip', async (req, res) => {
  const { userId, name, date, category, rating, description, image } = req.body;

  try {
    const newTrip = new Trip({ userId, name, date, category, rating, description, image });
    await newTrip.save();
    res.status(201).json({ message: 'Trip added successfully', trip: newTrip });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add trip', details: error.message });
  }
});

app.get('/user-trips', async (req, res) => {
  const { userId } = req.query;

  try {
    const trips = await Trip.find({ userId });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Shopping List Routes
app.get('/shopping-items', async (req, res) => {
  try {
    const shoppingItems = await ShoppingItem.find();
    res.json(shoppingItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/add-shopping-item', async (req, res) => {
  const { name } = req.body;

  try {
    const newShoppingItem = new ShoppingItem({ name });
    await newShoppingItem.save();
    res.status(201).json({ message: 'Shopping item added successfully', item: newShoppingItem });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/shopping-items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await ShoppingItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Shopping item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Weather API Route
async function fetchWeatherData() {
  try {
    const response = await fetch(process.env.WEATHER_API_URL, {
      headers: { 'User-Agent': process.env.WEATHER_API_USER_AGENT },
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
    res.status(500).json({ error: error.message });
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Export the app as a serverless function handler
module.exports.handler = serverless(app);
