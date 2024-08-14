import { MongoClient } from "mongodb";
const username = encodeURIComponent("karjuale");
const password = encodeURIComponent("2f3cvLHU40pc8CQj");
const uri = `mongodb+srv://${username}:${password}@cluster0.tikl9.mongodb.net/`;
const client = new MongoClient(uri);

const users = client.db("YuliaDB").collection("users");

export const start = async () => {
  try {
    await client.connect();
    console.log("db works");
    await client.db("YuliaDB").createCollection("users");
  } catch (e) {
    console.log("db not connected");
  }
};

export const addToDatabase = async (name: string, age: number) => {
  try {
    users.insertOne({ name: name, age: age });
  } catch (e) {
    console.log("cannot add to database");
  }
};
start();
