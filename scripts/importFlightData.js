const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB || 'airline_booking';

async function importFlightData() {
  const client = new MongoClient(DEFAULT_URI, { connectTimeoutMS: 10000 });

  // Resolve CSV path: check common locations
  const candidates = [
    path.resolve(process.cwd(), 'datasets', 'flight_price_dataset.csv'),
    path.resolve(process.cwd(), 'app', 'datasets', 'flight_price_dataset.csv'),
  ];

  const csvPath = candidates.find((p) => fs.existsSync(p));
  if (!csvPath) {
    console.error(`CSV file not found. Checked locations:\n${candidates.join('\n')}`);
    process.exit(1);
  }

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const flightsCollection = db.collection('flights');

    // Clear existing imported data (optional)
    await flightsCollection.deleteMany({ importedFrom: 'kaggle_dataset' });

    const flights = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Transform Kaggle data to our schema
            const price = parseFloat(row.price) || 0;
            const duration = parseFloat(row.duration) || 120;
            const stops = row.stops ? parseInt(row.stops, 10) : 0;

            const departOffsetDays = Math.floor(Math.random() * 90);
            const arrivalOffsetDays = departOffsetDays + Math.floor(Math.random() * 2);

            const flight = {
              airline: row.airline || 'Unknown',
              flightNumber: row.flight || `${(row.airline || 'FL').replace(/\s+/g, '')}-${Math.floor(Math.random() * 9999)}`,
              source: row.source_city || row.source || 'Unknown',
              destination: row.destination_city || row.destination || 'Unknown',
              departure: {
                date: new Date(Date.now() + departOffsetDays * 24 * 60 * 60 * 1000),
                time: row.departure_time || '10:00',
              },
              arrival: {
                date: new Date(Date.now() + arrivalOffsetDays * 24 * 60 * 60 * 1000),
                time: row.arrival_time || '12:00',
              },
              duration,
              stops,
              class: row.class || 'Economy',
              price,
              totalSeats: 180,
              availableSeats: Math.max(0, Math.min(180, Math.floor(Math.random() * 100) + 30)),
              importedFrom: 'kaggle_dataset',
            };

            flights.push(flight);
          } catch (err) {
            // ignore bad rows but log
            console.warn('Skipping row due to error:', err.message);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert all flights into MongoDB
    if (flights.length > 0) {
      const insertResult = await flightsCollection.insertMany(flights);
      console.log(`✅ Imported ${insertResult.insertedCount} flights from Kaggle dataset`);
    } else {
      console.log('No flights parsed from CSV.');
    }

    // Create indexes to improve search performance
    await flightsCollection.createIndex({ source: 1, destination: 1 });
    await flightsCollection.createIndex({ price: 1 });

    await client.close();
    console.log('Import complete. Connection closed.');
  } catch (error) {
    console.error('Import error:', error);
    try {
      await client.close();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

// Run the import when executed directly
if (require.main === module) {
  importFlightData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { importFlightData };
