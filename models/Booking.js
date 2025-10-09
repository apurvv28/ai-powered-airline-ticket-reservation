import { getDatabase } from "../lib/mongodb";
import { ObjectId } from "mongodb";

export async function createBooking({ flightId, passengerName, email, userId }) {
  const db = await getDatabase();
  const coll = db.collection("bookings");
  const doc = {
    flightId,
    passengerName,
    email,
    userId: userId || null,
    createdAt: new Date(),
  };
  const res = await coll.insertOne(doc);
  return { insertedId: res.insertedId, ...doc };
}

export async function listBookings({ userId } = {}) {
  const db = await getDatabase();
  const coll = db.collection("bookings");
  const filter = {};
  if (userId) filter.userId = userId;
  const rows = await coll.find(filter).sort({ createdAt: -1 }).toArray();
  return rows;
}

export async function getBookingById(id) {
  const db = await getDatabase();
  const coll = db.collection("bookings");
  return coll.findOne({ _id: typeof id === "string" ? new ObjectId(id) : id });
}
