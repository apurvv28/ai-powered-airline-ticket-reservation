const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'rzp_test_your_key_here', // Replace with your test key
  key_secret: 'your_secret_here' // Replace with your test secret
});

const app = express();
const port = 5000;

// Define cache directory
const cacheDir = path.join(__dirname, 'cache');

// Configure CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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
  totalSeats: { type: Number, max: 400 }, // Maximum 400 seats
  availableSeats: Number,
  seatMatrix: {
    rows: { type: Number, default: 40 }, // Default 40 rows
    columns: { type: Number, default: 10 }, // Default 10 seats per row (A-J)
    occupiedSeats: [{ type: String }], // Array of occupied seats (e.g., ["1A", "2B"])
  },
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

// Passenger Schema
const passengerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  passportNumber: { type: String },
  nationality: { type: String },
}, { timestamps: true });

const Passenger = mongoose.model('Passenger', passengerSchema, 'passengers');

// Insurance Schema
const insuranceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverage: { type: String, required: true },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Insurance = mongoose.model('Insurance', insuranceSchema, 'insurances');

// Booking Schema
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
  insuranceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurance' },
  bookingDate: { type: Date, default: Date.now },
  travelDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: String },
  totalAmount: { type: Number, required: true },
  flightAmount: { type: Number, required: true },
  insuranceAmount: { type: Number, default: 0 },
  seatNumber: { type: String },
  specialRequests: { type: String },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

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

// Helper function to generate a seat matrix
function generateSeatMatrix(rows, columns) {
  const availableSeats = [];
  const columnLetters = 'ABCDEFGHIJ'; // Extended to 10 columns (A-J)
  
  for (let row = 1; row <= rows; row++) {
    for (let col = 0; col < columns; col++) {
      availableSeats.push(`${row}${columnLetters[col]}`);
    }
  }
  
  return availableSeats;
}

// Helper function to validate flight capacity
async function validateFlightCapacity(flight) {
  if (!flight.totalSeats || flight.totalSeats > 400) {
    throw new Error('Invalid total seats configuration. Maximum allowed is 400 seats.');
  }

  // Ensure seatMatrix configuration matches totalSeats
  const maxSeats = flight.seatMatrix.rows * flight.seatMatrix.columns;
  if (maxSeats < flight.totalSeats) {
    // Adjust seat matrix if needed
    flight.seatMatrix.rows = Math.ceil(flight.totalSeats / 10); // 10 seats per row
    flight.seatMatrix.columns = 10;
  }

  // Update availableSeats count
  flight.availableSeats = flight.totalSeats - flight.seatMatrix.occupiedSeats.length;
  await flight.save();
  
  return flight;
}

// Helper function to get random available seat
async function getRandomAvailableSeat(flight) {
  // Validate flight capacity first
  await validateFlightCapacity(flight);
  
  const allPossibleSeats = generateSeatMatrix(flight.seatMatrix.rows, flight.seatMatrix.columns)
    .slice(0, flight.totalSeats); // Only use seats up to totalSeats
  const availableSeats = allPossibleSeats.filter(seat => !flight.seatMatrix.occupiedSeats.includes(seat));
  
  if (availableSeats.length === 0) {
    throw new Error('No seats available on this flight');
  }
  
  const randomIndex = Math.floor(Math.random() * availableSeats.length);
  return availableSeats[randomIndex];
}

// Helper function to assign seat to booking
async function assignSeatToBooking(flightId, bookingId) {
  const flight = await Flight.findById(flightId);
  if (!flight) {
    throw new Error('Flight not found');
  }

  if (flight.availableSeats <= 0) {
    throw new Error('No seats available on this flight');
  }

  const randomSeat = await getRandomAvailableSeat(flight);
  
  // Update flight's occupied seats and available seats count
  flight.seatMatrix.occupiedSeats.push(randomSeat);
  flight.availableSeats -= 1;
  await flight.save();
  
  // Update booking with seat number
  await Booking.findByIdAndUpdate(bookingId, { seatNumber: randomSeat });
  
  return randomSeat;
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

    // Save credentials with plain text password
    const credential = new AirlineCredential({
      airlineId: savedAirline._id,
      username,
      password // Store plain password directly
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

    // Verify password (plain text comparison)
    if (password !== credential.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      airline: credential.airlineId,
      token: "dummy-token" 
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

    // Validate total seats
    if (!flightData.totalSeats || flightData.totalSeats > 400) {
      return res.status(400).json({ 
        message: 'Invalid total seats. Maximum allowed is 400 seats.'
      });
    }

    // Calculate required rows based on total seats (10 seats per row)
    const requiredRows = Math.ceil(flightData.totalSeats / 10);
    
    // Set seat matrix configuration
    const seatMatrix = {
      rows: requiredRows,
      columns: 10,
      occupiedSeats: []
    };

    const flight = new Flight({
      ...flightData,
      airlineId,
      airline: airline.airlineName,
      seatMatrix,
      availableSeats: flightData.totalSeats // Initialize available seats
    });

    // Validate and save the flight
    try {
      await validateFlightCapacity(flight);
      const newFlight = await flight.save();
      res.status(201).json(newFlight);
    } catch (err) {
      console.error("Error creating flight:", err);
      res.status(500).json({ message: err.message });
    }
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

// Get all insurances
app.get("/api/insurances", async (req, res) => {
  try {
    const insurances = await Insurance.find({ isActive: true });
    res.json(insurances);
  } catch (err) {
    console.error("Error fetching insurances:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      flightId,
      passengerDetails,
      insuranceId,
      travelDate,
      contactEmail,
      contactPhone,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!flightId || !passengerDetails || !travelDate || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: "Missing required booking information" });
    }

    // Validate insurance if provided
    if (insuranceId) {
      const insurance = await Insurance.findById(insuranceId);
      if (!insurance || !insurance.isActive) {
        return res.status(400).json({ message: "Invalid or inactive insurance selected" });
      }
    }

    // Check if flight exists and has available seats
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    if (flight.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available for this flight" });
    }

    // Create passenger
    const passenger = new Passenger(passengerDetails);
    const savedPassenger = await passenger.save();

    // Calculate amounts
    let insuranceAmount = 0;
    let insurance = null;
    if (insuranceId) {
      insurance = await Insurance.findById(insuranceId);
      if (insurance) {
        insuranceAmount = insurance.price;
      }
    }

    const flightAmount = flight.discount?.hasDiscount
      ? (flight.discount.discountType === "percentage"
          ? flight.price * (1 - flight.discount.discountValue / 100)
          : Math.max(0, flight.price - flight.discount.discountValue))
      : flight.price;

    const totalAmount = flightAmount + insuranceAmount;

    // Generate unique booking ID
    const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create booking
    const booking = new Booking({
      bookingId,
      userId: req.body.userId, // Add userId from request body
      flightId,
      passengerId: savedPassenger._id,
      insuranceId: insurance?._id,
      travelDate: new Date(travelDate),
      totalAmount,
      flightAmount,
      insuranceAmount,
      contactEmail,
      contactPhone,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedBooking = await booking.save();

    // Update flight available seats
    await Flight.findByIdAndUpdate(flightId, {
      $inc: { availableSeats: -1 }
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
      passenger: savedPassenger,
      flight,
      insurance,
      totalAmount
    });

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create Razorpay order
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency, bookingId } = req.body;

    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: bookingId,
      notes: {
        bookingId: bookingId
      }
    });

    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: err.message });
  }
});

// Process payment and confirm booking
app.put("/api/bookings/:bookingId/payment", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentId, orderId, signature, paymentStatus } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check for valid payment status
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot process payment for booking with status: ${booking.status}. Only pending or confirmed bookings can be processed.`
      });
    }

    // Skip signature verification for dummy payments (paymentId starting with 'pay_' or no signature provided)
    const isDummyPayment = !signature || signature === '' || signature === 'null' || signature === 'undefined' || paymentId.startsWith('pay_');

    if (!isDummyPayment) {
      // Verify Razorpay signature using HMAC SHA256 for real payments
      const expectedSignature = crypto
        .createHmac('sha256', razorpay.key_secret)
        .update(orderId + "|" + paymentId)
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    // Update booking with payment info
    booking.paymentId = paymentId;
    booking.paymentStatus = paymentStatus;

    if (paymentStatus === 'completed') {
      booking.status = 'confirmed';

      try {
        // Assign a random seat to the booking
        const assignedSeat = await assignSeatToBooking(booking.flightId, booking._id);
        booking.seatNumber = assignedSeat;
      } catch (error) {
        console.error('Error assigning seat:', error);
        return res.status(400).json({ message: error.message });
      }
    } else if (paymentStatus === 'failed') {
      booking.status = 'cancelled';
      // Restore seat availability
      await Flight.findByIdAndUpdate(booking.flightId, {
        $inc: { availableSeats: 1 }
      });
    }

    await booking.save();

    res.json({
      message: "Payment processed successfully",
      booking
    });

  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get bookings for a specific user
app.get("/api/users/:userId/bookings", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for this user
    const bookings = await Booking.find({ userId })
      .populate('flightId')
      .populate('passengerId')
      .populate('insuranceId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get bookings for airline dashboard
app.get("/api/bookings/:airlineId", async (req, res) => {
  try {
    const { airlineId } = req.params;

    // Find all flights for this airline
    const flights = await Flight.find({ airlineId });
    const flightIds = flights.map(f => f._id);

    // Find bookings for these flights
    const bookings = await Booking.find({ flightId: { $in: flightIds } })
      .populate('flightId')
      .populate('passengerId')
      .populate('insuranceId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: err.message });
  }
});

// Seed insurances data (run once to populate database)
app.post("/api/insurances/seed", async (req, res) => {
  try {
    const insurances = [
      {
        name: "Basic Travel Insurance",
        description: "Essential coverage for trip cancellations and medical emergencies",
        coverage: "Trip cancellation, medical expenses up to $50,000, lost baggage",
        price: 25
      },
      {
        name: "Premium Travel Insurance",
        description: "Comprehensive coverage including COVID-19 protection",
        coverage: "Trip cancellation, medical expenses up to $100,000, lost baggage, COVID-19 coverage, trip delays",
        price: 50
      },
      {
        name: "Gold Travel Insurance",
        description: "Ultimate protection with worldwide coverage",
        coverage: "Trip cancellation, medical expenses up to $200,000, lost baggage, COVID-19 coverage, trip delays, adventure sports",
        price: 75
      }
    ];

    const savedInsurances = await Insurance.insertMany(insurances);
    res.status(201).json({
      message: "Insurance options seeded successfully",
      insurances: savedInsurances
    });

  } catch (err) {
    console.error("Error seeding insurances:", err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});