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
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v73g3gy.mongodb.net/?retryWrites=true&w=majority`;

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
    console.log("Database connected successfully!");
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
const boatsSailingCollection = db.collection("boatSell");
const boatsOwnerAdvertisedCollection = db.collection("boatOwner-Advertised");
const crewCollection = db.collection("crew");
const boatServiceCollection = db.collection("boat-service");
const boatServiceOrderCollection = db.collection("boat-service-order");
const crewServiceCollection = db.collection("Crew-Service");

// root routeusers
app.get("/", (req, res) => {
  res.send("Anyvessel is running");
});

// ==============  User  ============

// all users
app.get("/users", async (req, res) => {
  try {
    const boatsUser = await boatsCollection.find().toArray();
    const crewUser = await crewCollection.find().toArray();
    const boatsServiceUser = await boatServiceCollection.find().toArray();

    let users = [...boatsServiceUser, ...crewUser, ...boatsUser];

    const totalUsers = users.length;

    return res.status(200).send({ totalUsers, users });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// find one user
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  try {
    const boatsServiceUser = await boatServiceCollection.findOne({
      email: email,
    });
    console.log("boatsServiceUser", boatsServiceUser);
    if (boatsServiceUser) {
      return res.status(200).send(boatsServiceUser);
    }

    let user;
    if (!boatsServiceUser) {
      user = await crewCollection.findOne({ email: email });

      if (!user) {
        user = await boatsCollection.findOne({ email: email });
        return res.status(200).send(user);
      }

      return res.status(200).send(user);
    }

    return res.status(204).send({ message: "user not fount" });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// find one user data
app.get("/user-data/:email", async (req, res) => {
  const email = req.params.email;

  try {
    let user;
    const boatsServiceUser = await boatServiceCollection.findOne({ email });
    const boatServiceData = await boatServiceOrderCollection.findOne({
      userEmail: email,
    });
    user = {
      ...boatsServiceUser,
      serviceData: boatServiceData,
    };

    if (boatsServiceUser) {
      return res.status(200).send(user);
    }

    if (!boatsServiceUser) {
      const crewD = await crewCollection.findOne({ email });
      const crewServiceData = await crewServiceCollection.findOne({
        userEmail: email,
      });
      user = { ...crewD, serviceData: crewServiceData };

      if (!crewD) {
        user = await boatsCollection.findOne({ email });

        return res.status(200).send(user);
      }

      return res.status(200).send(user);
    }

    return res.status(204).send({ message: "user not fount" });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// delete user
app.delete("/user/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const objId = { _id: new ObjectId(id) };
    const boatsServiceUser = await boatServiceCollection.deleteOne(objId);

    if (boatsServiceUser) {
      return res.status(200).send(boatsServiceUser);
    }

    let result;
    if (!boatsServiceUser) {
      result = await crewCollection.deleteOne(objId);

      if (!result) {
        result = await boatsCollection.deleteOne(objId);
        return res.status(200).send(result);
      }

      return res.status(200).send(result);
    }

    return res.status(204).send({ message: "user not fount" });
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// ==============  Boats  ============

// get all boats
app.get("/boats", async (req, res) => {
  const cursor = boatsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// get all boats
app.get("/boat-sale-data", async (req, res) => {
  try {
    const cursor = boatsSailingCollection.find();
    const result = await cursor.toArray();
    res.status(200).send(result);
  } catch (error) {
    console.log("get crew data", error);
    res.status(500).send({ message: "Server Error" });
  }
});

// delete user
app.delete("/boat/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const objId = { _id: new ObjectId(id) };
    const result = await boatsCollection.deleteOne(objId);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// post boats
app.post("/boats", async (req, res) => {
  const body = req.body;
  const newData = {
    ...body,
    role: "boat",
  };
  const result = await boatsCollection.insertOne(newData);
  res.send(result);
});

// ================   Boat Sailing All Api   ===================================

app.get("/boat-sailing", async (req, res) => {
  const result = await boatsSailingCollection.find().toArray();
  res.send(result);
});

app.post("/boatSailing", async (req, res) => {
  const data = req.body;
  // console.log("data", data)
  const result = await boatsSailingCollection.insertOne(data);
  res.send(result);
});

// Update Sailing post Location

app.patch("/boatSailing-contact", async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const findBoatSailingAndUpdateContact =
      await boatsSailingCollection.findOneAndUpdate(
        {
          ownerUserEmail: body.ownerUserEmail,
        },
        {
          $set: {
            "contact.sellerName": body?.sellerName,
            "contact.sellerEmail": body?.sellerEmail,
            "contact.seller_Number": body?.seller_Number,
            "contact.seller_skype": body?.seller_skype,
          },
        }
      );
    console.log(findBoatSailingAndUpdateContact);
    res.send(findBoatSailingAndUpdateContact);
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// Update Sailing post Contact Info

app.patch("/boatSailing-location", async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const findBoatSailingAndUpdateLocation =
      await boatsSailingCollection.findOneAndUpdate(
        {
          ownerUserEmail: body.ownerUserEmail,
        },
        {
          $set: {
            "location.boarding_country": body?.boarding_country,
            "location.boarding_city": body?.boarding_city,
            "location.sailing_country": body?.sailing_country,
            "location.sailing_city": body?.sailing_city,
          },
        }
      );
    console.log(findBoatSailingAndUpdateLocation);
    res.send(findBoatSailingAndUpdateLocation);
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// ===================================================

// post Advertised

app.post("/boatOwner-advertised", async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const data = req.body;
    const result = await boatsOwnerAdvertisedCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// ==============  Crew  ============

// get all crew
app.get("/crew", async (req, res) => {
  const cursor = crewCollection.find();
  const result = await cursor.toArray();
  const totalCrew = result.length;
  res.status(200).send({ totalCrew, result });
});

// post crew
app.post("/crew", async (req, res) => {
  const body = req.body;
  const newData = {
    ...body,
    role: "crew",
  };
  const result = await crewCollection.insertOne(newData);
  res.send(result);
});

// ---- crew data ----

// get all crew data
app.get("/crew-data", async (req, res) => {
  try {
    const result = await crewServiceCollection.find().toArray();
    const totalCrew = result.length;
    return res.status(200).send({ totalCrew, crews: result });
  } catch (error) {
    console.log("get crew data", error);
    res.status(500).send({ message: "Server Error" });
  }
});

// get all crew data
app.get("/crew-data/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const objId = { _id: new ObjectId(id) };
    const result = await crewServiceCollection.findOne(objId);
    return res.status(200).send(result);
  } catch (error) {
    console.log("get crew data", error);
    res.status(500).send({ message: "Server Error" });
  }
});

// get crew data delete
app.delete("/crew-data/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const objId = { _id: new ObjectId(id) };
    const result = await crewServiceCollection.deleteOne(objId);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// crew server or post or profile
app.post("/crew-data", async (req, res) => {
  const newData = req.body;

  try {
    const query = { userEmail: newData?.userEmail };
    const findService = await crewServiceCollection?.findOne(query);

    if (!findService) {
      const result = await crewServiceCollection.insertOne(newData);
      return res.status(200).send(result);
    } else {
      return res.status(201).send({ message: "already Data submitted" });
    }
  } catch (error) {
    console.log("crew-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update crew service location
app.patch("/crew-data-location", async (req, res) => {
  const body = req.body;

  try {
    const findServiceAndUpdate = await crewServiceCollection.findOneAndUpdate(
      {
        userEmail: body.userEmail,
      },
      {
        $set: {
          "location.country": body?.country,
          "location.city": body?.city,
          "location.specify_address": body?.specify_address,
        },
      }
    );

    if (findServiceAndUpdate?.location?.country === body?.country) {
      res.status(200).send(findServiceAndUpdate);
    } else {
      res.status(201).send(findServiceAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update crew service contact
app.patch("/crew-data-contact", async (req, res) => {
  const body = req.body;
  try {
    const findServerContactAndUpdate =
      await crewServiceCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "contact.contactName": body?.contactName,
            "contact.contactEmail": body?.contactEmail,
            "contact.phoneNumber": body?.phoneNumber,
            "contact.Skype": body?.Skype,
            "contact.Website": body?.Website,
            "contact.facebook": body?.facebook,
            "contact.instagram": body?.instagram,
          },
        }
      );
    if (findServerContactAndUpdate?.contact.contactName !== body?.contactName) {
      res.status(200).send(findServerContactAndUpdate);
    } else {
      res.status(201).send(findServerContactAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service service
app.patch("/crew-data-service", async (req, res) => {
  const body = req.body;

  try {
    const findServiceAndUpdate = await crewServiceCollection.findOneAndUpdate(
      {
        userEmail: body.userEmail,
      },
      {
        $set: {
          "services.cleaning": body?.cleaning,
          "services.paining": body?.paining,
          "services.rigging": body?.rigging,
          "services.sailMakersRepairs": body?.sailMakersRepairs,
          "services.electrics": body?.electrics,
          "services.hvacAndPlumbing": body?.hvacAndPlumbing,
          "services.mechanics": body?.mechanics,
          "services.arrangementsAndDeliveries": body?.arrangementsAndDeliveries,
          "services.musicBands": body?.musicBands,
          "services.foodAndBeverage": body?.foodAndBeverage,
          "services.carRentals": body?.carRentals,
          "services.others": body?.others,
        },
      }
    );

    if (findServiceAndUpdate?.services.cleaning === body?.cleaning) {
      res.status(200).send(findServiceAndUpdate);
    } else {
      res.status(201).send(findServiceAndUpdate);
    }
  } catch (error) {
    console.log("crew-data-service", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service advert
app.patch("/crew-data-advert", async (req, res) => {
  const body = req.body;
  console.log(body);

  try {
    const findServiceAdvertAndUpdate =
      await crewServiceCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "advert.advert": body?.advert,
          },
        }
      );

    if (findServiceAdvertAndUpdate?.advert.advert !== body?.advert) {
      res.status(200).send(findServiceAdvertAndUpdate);
    } else {
      res.status(201).send(findServiceAdvertAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// ==============  boat Service  ============

// get all boat server
app.get("/boat-service", async (req, res) => {
  try {
    const result = await boatServiceOrderCollection.find().toArray();
    const totalBoatService = result.length;
    res.status(200).send({ totalBoatService, boatService: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// get boat server delete
app.delete("/boat-service-delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const objId = { _id: new ObjectId(id) };
    const result = await boatServiceOrderCollection.deleteOne(objId);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// post boat server
app.post("/boat-service", async (req, res) => {
  const body = req.body;
  const newData = {
    ...body,
    role: "boatServices",
  };
  const result = await boatServiceCollection.insertOne(newData);
  res.send(result);
});

// post boat server or order
app.post("/boat-services-data", async (req, res) => {
  const newData = req.body;

  try {
    const query = { userEmail: newData?.userEmail };
    const findService = await boatServiceOrderCollection?.findOne(query);

    if (!findService) {
      const result = await boatServiceOrderCollection.insertOne(newData);
      return res.status(200).send(result);
    } else {
      return res.status(201).send({ message: "already Data submitted" });
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service location
app.patch("/boat-services-data-location", async (req, res) => {
  const body = req.body;
  try {
    const findServiceOderAndUpdate =
      await boatServiceOrderCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "location.country": body?.country,
            "location.city": body?.city,
            "location.specify_address": body?.specify_address,
          },
        }
      );

    if (findServiceOderAndUpdate?.location?.country !== body?.country) {
      res.status(200).send(findServiceOderAndUpdate);
    } else {
      res.status(201).send(findServiceOderAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service contact
app.patch("/boat-services-data-contact", async (req, res) => {
  const body = req.body;
  try {
    const findServiceOderAndUpdate =
      await boatServiceOrderCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "contact.contactName": body?.contactName,
            "contact.contactEmail": body?.contactEmail,
            "contact.phoneNumber": body?.phoneNumber,
            "contact.Skype": body?.Skype,
            "contact.Website": body?.Website,
            "contact.facebook": body?.facebook,
            "contact.instagram": body?.instagram,
          },
        }
      );
    if (findServiceOderAndUpdate?.contact.contactName !== body?.contactName) {
      res.status(200).send(findServiceOderAndUpdate);
    } else {
      res.status(201).send(findServiceOderAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service service
app.patch("/boat-services-data-service", async (req, res) => {
  const body = req.body;

  try {
    const findServiceOderAndUpdate =
      await boatServiceOrderCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "services.cleaning": body?.cleaning,
            "services.paining": body?.paining,
            "services.rigging": body?.rigging,
            "services.sailMakersRepairs": body?.sailMakersRepairs,
            "services.electrics": body?.electrics,
            "services.hvacAndPlumbing": body?.hvacAndPlumbing,
            "services.mechanics": body?.mechanics,
            "services.arrangementsAndDeliveries":
              body?.arrangementsAndDeliveries,
            "services.musicBands": body?.musicBands,
            "services.foodAndBeverage": body?.foodAndBeverage,
            "services.carRentals": body?.carRentals,
            "services.others": body?.others,
          },
        }
      );

    if (findServiceOderAndUpdate?.services.cleaning !== body?.cleaning) {
      res.status(200).send(findServiceOderAndUpdate);
    } else {
      res.status(201).send(findServiceOderAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service advert
app.patch("/boat-services-data-advert", async (req, res) => {
  const body = req.body;

  try {
    const findServiceOderAndUpdate =
      await boatServiceOrderCollection.findOneAndUpdate(
        {
          userEmail: body.userEmail,
        },
        {
          $set: {
            "advert.advert": body?.advert,
          },
        }
      );

    if (findServiceOderAndUpdate?.advert.advert !== body?.advert) {
      res.status(200).send(findServiceOderAndUpdate);
    } else {
      res.status(201).send(findServiceOderAndUpdate);
    }
  } catch (error) {
    console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// server listen or running
app.listen(port, () => {
  console.log(`anyVessel Server is running ${port}`);
});
