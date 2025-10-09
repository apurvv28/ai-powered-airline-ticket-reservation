import { MongoClient } from "mongodb";

// Default to local MongoDB for development (MongoDB Compass / local server)
// You can override by setting MONGODB_URI in .env.local
const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017";
const uri = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;

// Allow overriding DB name; default to 'airline_booking'
const DB_NAME = process.env.MONGODB_DB || "airline_booking";

const options = {
  // Use unified topology and modern parser by default (these are defaults in newer drivers)
};

let client;
let clientPromise;

// Use a global variable in development to preserve the client across module reloads
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Helper to get the database instance
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export default clientPromise;