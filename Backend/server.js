const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const port = 5000;

// Define cache directory
const cacheDir = path.join(__dirname, 'cache');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/airline_booking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Airline Schema
const airlineSchema = new mongoose.Schema({
  airlineName: { type: String, required: true, unique: true },
  airlineCode: { type: String, required: true, unique: true }, // 3-letter code
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Airline Credentials Schema
const airlineCredentialSchema = new mongoose.Schema({
  airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Airline = mongoose.model('Airline', airlineSchema);
const AirlineCredential = mongoose.model('AirlineCredential', airlineCredentialSchema);

const flightSchema = new mongoose.Schema({
  airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  airline: String,
  flightNumber: String,
  source: String,
  destination: String,
  departure: {
    date: Date,
    time: String,
  },
  arrival: {
    date: Date,
    time: String,
  },
  duration: Number,
  stops: Number,
  class: String,
  price: Number,
  totalSeats: Number,
  availableSeats: Number,
  operatingDays: [String],
  isActive: { type: Boolean, default: true },
  discount: {
    hasDiscount: { type: Boolean, default: false },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, default: 0 },
    discountStartDate: Date,
    discountEndDate: Date
  },
  aircraftType: String,
  baggageAllowance: String,
  createdAt: { type: Date, default: Date.now }
});

// Make sure the model uses the correct collection name
const Flight = mongoose.model('Flight', flightSchema, 'airline_flights');

// User Schema (was missing)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
}, { timestamps: true });

// Ensure the collection name matches existing usage (if any)
const User = mongoose.model('User', userSchema, 'users');

// Updated /flights endpoint with proper operating days filtering
app.get("/flights", async (req, res) => {
  try {
    const { source, destination, departureDate } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        message: "Source and destination query parameters are required.",
      });
    }

    const cacheBase = `${source.toLowerCase()}_${destination.toLowerCase()}`;
    const formattedDateForCache = departureDate
      ? parseDateToIso(departureDate)
      : null;
    
    const cacheFileName = formattedDateForCache
      ? `${cacheBase}_${formattedDateForCache}.json`
      : `${cacheBase}.json`;
    const cacheFilePath = path.join(cacheDir, cacheFileName);

    if (fs.existsSync(cacheFilePath)) {
      console.log(`Serving flights from cache: ${cacheFileName}`);
      const cachedData = fs.readFileSync(cacheFilePath, "utf-8");
      return res.json(JSON.parse(cachedData));
    }

    // Base query for source and destination from airline_flights collection
    const query = {
      source: { $regex: new RegExp(`^${escapeRegex(source)}$`, "i") },
      destination: { $regex: new RegExp(`^${escapeRegex(destination)}$`, "i") },
      isActive: true
    };

    console.log(`Querying airline_flights collection with:`, query);
    
    let flights = await Flight.find(query);
    console.log(`Found ${flights.length} flights from airline_flights for ${source} to ${destination}`);

    // Debug: Log the operating days of found flights
    flights.forEach(flight => {
      console.log(`Flight ${flight.flightNumber}: operatingDays =`, flight.operatingDays);
    });

    // If departure date is provided, filter by operating days
    if (formattedDateForCache) {
      const searchDate = new Date(formattedDateForCache);
      const dayOfWeek = getDayOfWeek(searchDate);
      
      console.log(`Filtering for date: ${formattedDateForCache}, day: ${dayOfWeek}`);
      
      const initialCount = flights.length;
      flights = flights.filter(flight => {
        if (!flight.operatingDays || flight.operatingDays.length === 0) {
          console.log(`Flight ${flight.flightNumber}: No operating days specified, including in results`);
          return true; // If no operating days specified, show all flights
        }
        
        const operatesOnDay = flight.operatingDays.includes(dayOfWeek);
        console.log(`Flight ${flight.flightNumber}: ${flight.operatingDays} includes ${dayOfWeek}? ${operatesOnDay}`);
        return operatesOnDay;
      });
      
      console.log(`After day filter: ${flights.length} flights (was ${initialCount})`);
    }

    // Add calculated departure dates for each flight based on search date
    const flightsWithDates = flights.map(flight => {
      let departureDateForFlight;
      
      if (formattedDateForCache) {
        // Use the searched date
        departureDateForFlight = new Date(formattedDateForCache);
      } else {
        // Find next available date based on operating days
        departureDateForFlight = findNextOperatingDate(flight.operatingDays);
      }
      
      const arrivalDateForFlight = calculateArrivalDate(
        departureDateForFlight, 
        flight.departure.time, 
        flight.arrival.time, 
        flight.duration
      );

      return {
        ...flight.toObject(),
        calculatedDeparture: {
          date: departureDateForFlight,
          time: flight.departure.time
        },
        calculatedArrival: {
          date: arrivalDateForFlight,
          time: flight.arrival.time
        },
        searchDate: formattedDateForCache
      };
    });

    fs.writeFileSync(cacheFilePath, JSON.stringify(flightsWithDates));
    console.log(`Cached ${flightsWithDates.length} flights to file: ${cacheFileName}`);

    return res.json(flightsWithDates);
  } catch (err) {
    console.error("Error fetching flights from airline_flights:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to parse date to ISO format (YYYY-MM-DD)
function parseDateToIso(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Helper function to get day of week in short format (sun, mon, etc.)
function getDayOfWeek(date) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

// Helper function to find the next operating date for a flight
function findNextOperatingDate(operatingDays) {
  if (!operatingDays || operatingDays.length === 0) {
    return new Date(); // Return today if no operating days specified
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayDay = days[today.getDay()];

  // Check if today is an operating day
  if (operatingDays.includes(todayDay)) {
    return today;
  }

  // Find the next operating day within the next 6 days
  for (let i = 1; i <= 6; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const nextDay = days[nextDate.getDay()];
    
    if (operatingDays.includes(nextDay)) {
      return nextDate;
    }
  }

  // If no operating day found in next 6 days, return the first operating day from next week
  const nextDate = new Date(today);
  const firstOperatingDay = operatingDays[0];
  const targetDayIndex = days.indexOf(firstOperatingDay);
  const currentDayIndex = today.getDay();
  
  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) daysToAdd += 7;
  
  nextDate.setDate(today.getDate() + daysToAdd);
  return nextDate;
}

// Helper function to calculate arrival date considering overnight flights
function calculateArrivalDate(departureDate, departureTime, arrivalTime, durationMinutes) {
  const arrivalDate = new Date(departureDate);

  if (!departureTime || !arrivalTime) {
    // If times not available, use duration
    arrivalDate.setMinutes(arrivalDate.getMinutes() + (durationMinutes || 0));
    return arrivalDate;
  }

  const [depHours, depMinutes] = departureTime.split(':').map(Number);
  const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);

  // Set departure time
  arrivalDate.setHours(depHours, depMinutes, 0, 0);

  // Add the flight duration
  arrivalDate.setMinutes(arrivalDate.getMinutes() + (durationMinutes || 0));

  return arrivalDate;
}

// Helper function to generate airline code
function generateAirlineCode(airlineName) {
  const words = airlineName.split(' ');
  let code = '';
  for (let word of words) {
    code += word.charAt(0).toUpperCase();
  }
  return code.slice(0, 3);
}

// Helper function to generate random number
function generateRandomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Airline Registration Endpoint
app.post("/api/airlines/register", async (req, res) => {
  try {
    const { airlineName, email, phone, address, contactPerson } = req.body;

    // Check if airline already exists
    const existingAirline = await Airline.findOne({ 
      $or: [{ airlineName }, { email }] 
    });
    
    if (existingAirline) {
      return res.status(400).json({ 
        message: "Airline with this name or email already exists" 
      });
    }

    // Generate airline code
    const airlineCode = generateAirlineCode(airlineName);

    // Create new airline
    const airline = new Airline({
      airlineName,
      airlineCode,
      email,
      phone,
      address,
      contactPerson
    });

    const savedAirline = await airline.save();

    // Generate credentials
    const randomNumber = generateRandomNumber();
    const password = airlineCode + randomNumber;
    const username = `${airlineName.replace(/\s+/g, '').toLowerCase()}@skywings`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save credentials
    const credential = new AirlineCredential({
      airlineId: savedAirline._id,
      username,
      password: hashedPassword
    });

    await credential.save();

    // Return credentials (in production, this should be sent via email)
    res.status(201).json({
      message: "Airline registered successfully",
      credentials: {
        username,
        password, // This is the plain password for initial setup
        airlineCode
      },
      airline: savedAirline
    });

  } catch (err) {
    console.error("Error registering airline:", err);
    res.status(500).json({ message: err.message });
  }
});

// Airline Login Endpoint
app.post("/api/airlines/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find credential
    const credential = await AirlineCredential.findOne({ username })
      .populate('airlineId');
    
    if (!credential) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if airline is active
    if (!credential.airlineId.isActive) {
      return res.status(401).json({ message: "Airline account is deactivated" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, credential.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      airline: credential.airlineId,
      token: "dummy-token" // In production, use JWT
    });

  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get flights for specific airline (admin panel)
app.get("/api/airlines/:airlineId/flights", async (req, res) => {
  try {
    const { airlineId } = req.params;
    
    const flights = await Flight.find({ airlineId })
      .sort({ createdAt: -1 });
    
    res.json(flights);
  } catch (err) {
    console.error("Error fetching airline flights:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add new flight (admin panel) - UPDATED TO HANDLE NEW FIELDS
app.post("/api/airlines/:airlineId/flights", async (req, res) => {
  try {
    const { airlineId } = req.params;
    const flightData = req.body;

    // Verify airline exists
    const airline = await Airline.findById(airlineId);
    if (!airline) {
      return res.status(404).json({ message: "Airline not found" });
    }

    const flight = new Flight({
      ...flightData,
      airlineId,
      airline: airline.airlineName
    });

    const newFlight = await flight.save();
    res.status(201).json(newFlight);

  } catch (err) {
    console.error("Error creating flight:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update flight (admin panel)
app.put("/api/airlines/flights/:flightId", async (req, res) => {
  try {
    const { flightId } = req.params;
    const flightData = req.body;

    const updatedFlight = await Flight.findByIdAndUpdate(
      flightId,
      flightData,
      { new: true }
    );

    if (!updatedFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json(updatedFlight);
  } catch (err) {
    console.error("Error updating flight:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete flight (admin panel)
app.delete("/api/airlines/flights/:flightId", async (req, res) => {
  try {
    const { flightId } = req.params;

    const deletedFlight = await Flight.findByIdAndDelete(flightId);
    if (!deletedFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.json({ message: "Flight deleted successfully" });
  } catch (err) {
    console.error("Error deleting flight:", err);
    res.status(500).json({ message: err.message });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register new user (hash password and validate)
app.post("/users", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashed, firstName, lastName, phone });
    const newUser = await user.save();

    const safeUser = newUser.toObject();
    delete safeUser.password;

    res.status(201).json(safeUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login endpoint for users
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: 'Login successful', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});