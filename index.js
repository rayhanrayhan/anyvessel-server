const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// MongoDB connection 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v73g3gy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const boatsCollection = client.db('anyvesselServer').collection('boats');
        const crewCollection = client.db('anyvesselServer').collection('crew');

        // get all boats
        app.get('/boats', async (req, res) => {
            const cursor = boatsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // post boats
        app.post('/boats', async (req, res) => {
            const newData = req.body;
            const result = await boatsCollection.insertOne(newData);
            res.send(result)
        })

        // get all crew
        app.get('/crew', async (req, res) => {
            const cursor = crewCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // post crew
        app.post('/crew', async (req, res) => {
            const newData = req.body;
            const result = await crewCollection.insertOne(newData);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Anyvessel is running')
})
run().catch(console.dir);

app.listen(port, () => {
    console.log(`anyvessel Server is running ${port}`);
});
