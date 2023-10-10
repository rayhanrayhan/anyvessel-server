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
// const uri = `mongodb+srv://anyvesselServer:moBYdsTRiKIQIs1l@cluster0.v73g3gy.mongodb.net/?retryWrites=true&w=majority`;

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
const usersCollection = db.collection("users");
const boatsCollection = db.collection("boats");
const crewCollection = db.collection("crew");

// root route
app.get("/", (req, res) => {
  res.send("Anyvessel is running");
});

// get all boats
app.get("/boats", async (req, res) => {
  const cursor = boatsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// post boats
app.post("/boats", async (req, res) => {
  const newData = req.body;
  const query = { email: newData.email }
  const user = {
    email: newData.email,
    fullName: newData.fullName,
    phone: newData.phone,
    picture: newData.picture,
  }
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return
  }
  const addUser = await usersCollection.insertOne(user);
  const result = await boatsCollection.insertOne(newData);
  res.send(result);
});

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

app.listen(port, () => {
  console.log(`anyvessel Server is running ${port}`);
});