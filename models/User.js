import { getDatabase } from "../lib/mongodb";
import { ObjectId } from "mongodb";

export async function createUser({ name, email, passwordHash }) {
  const db = await getDatabase();
  const coll = db.collection("users");
  const doc = { name, email, passwordHash, createdAt: new Date() };
  const res = await coll.insertOne(doc);
  return { insertedId: res.insertedId, ...doc };
}

export async function findUserByEmail(email) {
  const db = await getDatabase();
  const coll = db.collection("users");
  return coll.findOne({ email });
}

export async function findUserById(id) {
  const db = await getDatabase();
  const coll = db.collection("users");
  return coll.findOne({ _id: typeof id === "string" ? new ObjectId(id) : id });
}
