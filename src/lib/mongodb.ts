import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

export default clientPromise;
