import { getDatabase } from "../lib/mongodb";

export async function searchFlights({ origin, destination, departDate, returnDate, passengers, cabin }) {
  const db = await getDatabase();
  const coll = db.collection("flights");

  const query = {
    origin: { $regex: new RegExp(origin, "i") },
    destination: { $regex: new RegExp(destination, "i") },
  };

  if (departDate) query.departDate = departDate;
  // Note: returnDate filtering is optional depending on how flights are stored

  const results = await coll.find(query).limit(100).toArray();
  return results;
}

export async function getFlightById(id) {
  const db = await getDatabase();
  const coll = db.collection("flights");
  return coll.findOne({ _id: id });
}
