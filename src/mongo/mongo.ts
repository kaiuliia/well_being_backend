import { MongoClient } from "mongodb";

const username = encodeURIComponent("karjuale");
const password = encodeURIComponent("sgiBFy1MaC0h1Plk");
const uri = `mongodb+srv://${username}:${password}@cluster0.tikl9.mongodb.net/`;
const client = new MongoClient(uri);

const users = client.db("YUapp").collection("users");

export const start = async () => {
  console.log("db connects");
  try {
    await client.connect();
    console.log("db works");
    await client.db("YUapp").createCollection("users");
  } catch (e) {
    console.log("db not connecte");
    console.log(e);
  }
};

export const addToDatabase = async (name: string, age: number) => {
  try {
    users.insertOne({ name: name, age: age });
  } catch (e) {
    console.log("cannot add to database");
  }
};
// start();
