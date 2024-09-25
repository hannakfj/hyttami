const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); 

// Initialize Express app
const app = express();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI;


app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// MongoDB connection and GridFS bucket setup
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
let upload;

conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });

  const storage = new GridFsStorage({
    db: conn.db, // Use db instance from the connection
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) return reject(err);
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });

  upload = multer({ storage });
  console.log('MongoDB connection established and GridFS storage engine ready.');
});

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Schemas and Models (same as your original code)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// const cabinSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: String
// });

const checkInSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
});

const checkOutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
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
  image: { type: String }, // Base64 string
});


const CheckInItem = mongoose.model('CheckInItem',checkInSchema); 
const CheckOutItem = mongoose.model('CheckOutItem',checkOutSchema); 
const ShoppingItem = mongoose.model('ShoppingItem',shoppingListSchema); 
const User = mongoose.model('User', userSchema);
// const Cabin = mongoose.model('Cabin', cabinSchema);
const Trip = mongoose.model('Trip', tripSchema);


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password' });
    }

    // Respond with the user object, including userId
    res.json({
      message: `Welcome ${user.username}`,
      userId: user._id,  
      username: user.username
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to add a new user
app.post('/add-user', async (req, res) => {
  const { username, password, cabinId } = req.body;

  try {
    // Check if the username already exists
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      password
    });

    // Save to database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to add a new cabin
app.post('/add-cabin', async (req, res) => {
  const { name, location } = req.body;

  try {
    // Check if the cabin already exists
    let existingCabin = await Cabin.findOne({ name });
    if (existingCabin) {
      return res.status(400).json({ message: 'Cabin already exists' });
    }

    // Create new cabin
    const newCabin = new Cabin({ name, location });

    // Save to database
    await newCabin.save();

    res.status(201).json({ message: 'Cabin created successfully', cabin: newCabin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



//get checkout items
app.get('/checkout-items', async (req, res) => {
  try {
    const checkOutItems = await CheckOutItem.find();
    res.json(checkOutItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// register new trip
app.post('/add-trip', async (req, res) => {
  const { userId, name, date, category, rating, description, image } = req.body;

  try {
    const newTrip = new Trip({
      userId,
      name,
      date,
      category,
      rating,
      description,
      image, // Save base64 image string
    });
    await newTrip.save();
    res.status(201).json({ message: 'Trip added successfully', trip: newTrip });
  } catch (error) {
    console.error("Error saving trip:", error);
    res.status(400).json({ error: 'Failed to add trip', details: error.message });
  }
});

// get all the trips for the user.
app.get('/user-trips', async (req, res) => {
  const { userId } = req.query;

  try {
    const trips = await Trip.find({ userId });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});


//shoppinglist routes
//get all items
app.get('/shopping-items', async (req, res) => {
  try {
    const shoppingItems = await ShoppingItem.find();
    res.json(shoppingItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//add a new element
app.post('/add-shopping-item', async (req, res) => {
  const { name, location } = req.body;

  try {
    const newShoppingItem = new ShoppingItem({ name, location });
    await newShoppingItem.save();
    res.status(201).json({ message: 'Shopping item added successfully', item: newShoppingItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//delete element from shoppinglist
app.delete('/shopping-items/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedItem = await ShoppingItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Shopping item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// app.put('/shopping-items/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, location } = req.body;

//   try {
//     const updatedItem = await ShoppingItem.findByIdAndUpdate(id, { name, location }, { new: true });
//     if (!updatedItem) {
//       return res.status(404).json({ message: 'Item not found' });
//     }
//     res.status(200).json({ message: 'Shopping item updated successfully', item: updatedItem });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


//get all users
app.get('/get-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


async function fetchWeatherData() {
  try {
    const response = await fetch(process.env.WEATHER_API_URL, {
      headers: { 'User-Agent': process.env.WEATHER_API_USER_AGENT }
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

// Weather API Route
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});


async function fetchWeatherData() {
  try {
    const response = await fetch(process.env.APIURLYR, {
      headers: { 'User-Agent': process.env.WEATHER_API_USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Use backticks for template literals
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch weather data: ' + error.message);
  }
}

// Weather API Route
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server locally or export for serverless deployment
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on Port ${PORT}`);
  });
}

// Export the app as a serverless function handler
module.exports.handler = serverless(app);
