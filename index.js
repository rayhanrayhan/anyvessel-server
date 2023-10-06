// console clear
console.clear();

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v73g3gy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// data base connections
async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// data collection
const db = client.db("anyvesselServer");
const boatsCollection = db.collection("boats");
const crewCollection = db.collection("crew");
const boatServiceCollection = db.collection("boat-service");

// root route
app.get("/", (req, res) => {
  res.send("Anyvessel is running");
});

// ==============  Boats  ============

// get all boats
app.get("/boats", async (req, res) => {
  const cursor = boatsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// post boats
app.post("/boats", async (req, res) => {
  const newData = req.body;
  const result = await boatsCollection.insertOne(newData);
  res.send(result);
});

// ==============  Crew  ============

// get all crew
app.get("/crew", async (req, res) => {
  const cursor = crewCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// post crew
app.post("/crew", async (req, res) => {
  const newData = req.body;
  const result = await crewCollection.insertOne(newData);
  res.send(result);
});

// ==============  boat Service  ============

// get all crew
app.get("/boat-service", async (req, res) => {
  try {
    const result = await boatServiceCollection.find().toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// post crew
app.post("/boat-service", async (req, res) => {
  const newData = req.body;
  const result = await boatServiceCollection.insertOne(newData);
  res.send(result);
});

// ===================================================

// server listen or running
app.listen(port, () => {
  console.log(`anyvessel Server is running ${port}`);
});
