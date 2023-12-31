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

// database collection
const db = client.db("anyvesselServer");
const usersCollection = db.collection("users");
// boat collection
const boatsCollection = db.collection("boats");
const boatsOwnerGallery = db.collection("boat-owner-photos");
const blogPost = db.collection("blog-post");
// boat sailing collection
const boatsSailingCollection = db.collection("boatSell");
// boat Owner Advertised Collection
const boatsOwnerAdvertisedCollection = db.collection("boatOwner-Advertised");
// Crew Collection
const crewServiceCollection = db.collection("Crew-Service");
const crewCollection = db.collection("crew");
// boat service collection
const boatServiceUserCls = db.collection("boat-service");
const boatServiceOrderCollection = db.collection("boat-service-order");

// root route
app.get("/", (req, res) => {
  res.send("Anyvessel is running");
});

// ==============  User  ============

// all users
app.get("/users", async (req, res) => {
  try {
    const boatsUser = await boatsCollection.find().toArray();
    const crewUser = await crewCollection.find().toArray();
    const boatsServiceUser = await boatServiceUserCls.find().toArray();

    let users = [...boatsServiceUser, ...crewUser, ...boatsUser];

    const totalUsers = users.length;

    return res.status(200).send({ totalUsers, users });
  } catch (error) {
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// find one user
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const boatsServiceUser = await boatServiceUserCls.findOne({
      email: email,
    });
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
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// find one user data
app.get("/user-data/:email", async (req, res) => {
  const email = req.params.email;

  try {
    let user;
    const boatsServiceUser = await boatServiceUserCls.findOne({ email });
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
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// delete user
app.delete("/user/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const objId = { _id: new ObjectId(id) };
    const boatsServiceUser = await boatServiceUserCls.deleteOne(objId);

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
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// ==============  Boats  ============

// get all boats
app.get("/boats", async (req, res) => {
  try {
    const cursor = boatsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// Single boats
app.get("/boat/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const objId = { _id: new ObjectId(id) };
    const result = await boatsCollection.findOne(objId);
    return res.status(200).send(result);
  } catch (error) {
    // console.log(error);
    res.status(404).send({ message: "Server Broken!" });
  }
});

// get all boats
app.get("/boat-sale-data", async (req, res) => {
  try {
    const cursor = boatsSailingCollection.find();
    const result = await cursor.toArray();
    res.status(200).send(result);
  } catch (error) {
    // console.log("get crew data", error);
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
    // console.log(error);
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

// Profile Update
app.patch("/profile-updates/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // Checking the user
  const query = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedData };
  const result = await usersCollection.updateOne(query, updateDoc);

  res.send(result);
});

// create or update gallery image
app.post("/gallery", async (req, res) => {
  const body = req.body;
  try {
    if (!body?.userId) {
      return res.status(404).json({ message: "User Id Required" });
    }

    // if gallery id
    if (body?.galleryId) {
      const query = { userId: body?.userId };
      const updateDoc = {
        $set: {
          vesselImages: body?.vesselImages,
        },
      };
      const UpdateResult = await boatsOwnerGallery.findOneAndUpdate(
        query,
        updateDoc,
        { upsert: true }
      );
      return res
        .status(202)
        .json({ message: "update successful!", data: UpdateResult });
    }

    const newData = {
      ...body,
    };

    const result = await boatsOwnerGallery.insertOne(newData);
    if (result?.insertedId) {
      const findGalleryData = await boatsOwnerGallery.findOne({
        userId: body?.userId,
      });
      return res.status(201).json({
        message: "gallery save and data get success!",
        data: {
          created: result,
          gallery: findGalleryData,
        },
      });
    }
    return res.status(200).send(result);
  } catch (error) {
    // console.log(`app.post("/gallery", `, error);
    return res.status(303).json("Server Broken");
  }
});

// find Gallery Data
app.get("/gallery/:userId", async (req, res) => {
  const userId = req?.params?.userId;

  try {
    if (!userId) {
      return res.status(404).json({ message: "User Id Required" });
    }

    const findGalleryData = await boatsOwnerGallery.findOne({ userId: userId });
    return res.status(201).json({
      message: "gallery data getting success!",
      data: findGalleryData,
    });
  } catch (error) {
    // console.log(`app.post("/gallery", `, error);
    return res.status(303).json("Server Broken");
  }
});

// gallery image favorite toggle
app.put("/gallery-img-loved-update/:objId/:imgId", async (req, res) => {
  const { objId, imgId } = req.params;
  const { loved } = req.body;

  try {
    if (!objId || !imgId) {
      return res.status(400).json({
        message: "objId, imgId, and loved are required in the request",
      });
    }

    // Update the "loved" property for the matching object in the array
    const lovedUpdated = await boatsOwnerGallery.updateOne(
      {
        _id: new ObjectId(objId),
        "vesselImages.id": imgId,
      },
      {
        $set: {
          "vesselImages.$.loved": loved,
        },
      }
    );

    return res.status(200).json({
      message: "Loved property updated successfully",
      lovedUpdated,
    });
  } catch (error) {
    console.error(`app.put("/gallery-img-update, `, error);
    return res.status(500).json("Server Error");
  }
});

// find Gallery Data
app.delete("/gallery-img-delete/:userId/:imgId", async (req, res) => {
  const { userId, imgId } = req?.params;
  console.log("userId -> ", userId);
  console.log("imgId -> ", imgId);

  try {
    if (!userId) {
      return res.status(404).json({ message: "UserId or imgId Required" });
    }

    const result = await boatsOwnerGallery.updateOne(
      { userId },
      { $pull: { vesselImages: { id: parseInt(imgId) } } }
    );

    console.log("result ", result);

    if (result?.modifiedCount === 1) {
      return res.status(200).send("VesselImage deleted successfully");
    } else {
      return res.status(404).send("VesselImage not found");
    }
  } catch (error) {
    console.log(`app.delete("/gallery-img-delete, `, error);
    return res.status(303).json("Server Broken");
  }
});

// create or update blog post image
app.post("/post-create", async (req, res) => {
  const body = req.body;
  try {
    if (!body?.userId) {
      return res.status(404).json({ message: "User Id Required" });
    }

    const newData = {
      ...body,
    };

    const result = await blogPost.insertOne(newData);
    return res.status(201).json({
      message: "post create success!",
      data: result,
    });
  } catch (error) {
    // console.log(`app.post("/post-create" `, error);
    return res.status(303).json("Server Broken");
  }
});

// update blog post
app.patch("/blog-post-cart-update", async (req, res) => {
  const body = req.body;

  try {
    if (!body?.postId) {
      return res.status(404).json({ message: "Post Id Required" });
    }

    const query = { _id: new ObjectId(body?.postId) };
    const updateDoc = { $set: { description: body?.description } };
    const result = await blogPost.updateOne(query, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      message: "Post update success!",
      data: result,
    });
  } catch (error) {
    console.log(`app.patch("/blog-post-cart-update" `, error);
    return res.status(500).json("Server Error");
  }
});

// find blog Post Data
app.get("/get-posts/:userId", async (req, res) => {
  const userId = req?.params?.userId;
  try {
    if (!userId) {
      return res.status(404).json({ message: "User Id Required" });
    }

    const findPostData = await blogPost.find({ userId }).toArray();
    return res.status(201).json({
      message: "post data getting success!",
      data: findPostData,
    });
  } catch (error) {
    // console.log(`app.get("/post/ `, error);
    return res.status(303).json("Server Broken");
  }
});

app.delete("/blog-post-cart-delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const objId = { _id: new ObjectId(id) };
    const result = await blogPost.deleteOne(objId);
    res.status(200).send(result);
  } catch (error) {
    // console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// ================ Boat Sailing All Api   ==================

app.get("/boat-sailing", async (req, res) => {
  const result = await boatsSailingCollection.find().toArray();
  res.send(result);
});

app.get("/boatDetails/:id", async (req, res) => {
  const id = req.params.id;
  const result = await boatsSailingCollection.findOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});
app.get("/boatSailingPost/:email", async (req, res) => {
  const email = req.params.email;
  const result = await boatsSailingCollection
    .find({ ownerUserEmail: email })
    .toArray();
  res.send(result);
});

app.post("/boatSailing", async (req, res) => {
  const data = req.body;
  const result = await boatsSailingCollection.insertOne(data);
  res.send(result);
});

// Update Sailing post Location
app.patch("/boatSailing-contact", async (req, res) => {
  const body = req.body;

  try {
    const findBoatSailingAndUpdateContact =
      await boatsSailingCollection.findOneAndUpdate(
        {
          _id: new ObjectId(body.newPostID),
        },
        {
          $set: {
            contact: body,
          },
        }
      );

    res.send(findBoatSailingAndUpdateContact);
  } catch (error) {
    // console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// Update Sailing post Contact Info
app.patch("/boatSailing-location", async (req, res) => {
  const body = req.body;

  try {
    const findBoatSailingAndUpdateLocation =
      await boatsSailingCollection.findOneAndUpdate(
        {
          _id: new ObjectId(body.newPostID),
        },
        {
          $set: {
            location: body,
          },
        }
      );

    res.send(findBoatSailingAndUpdateLocation);
  } catch (error) {
    // console.log("boatSailing-location", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// ===================================================

// post Advertised
app.post("/boatOwner-advertised", async (req, res) => {
  const body = req.body;

  try {
    const data = req.body;
    const result = await boatsOwnerAdvertisedCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    // console.log("boatOwner-advertised", error);
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
    // console.log("get crew data", error);
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
    // console.log("get crew data", error);
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
    // console.log(error);
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
    // console.log("crew-data", error);
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
    // console.log("crew-data-location", error);
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
    // console.log("crew-data-contact", error);
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
    // console.log("crew-data-service", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// update service advert
app.patch("/crew-data-advert", async (req, res) => {
  const body = req.body;

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
    // console.log("crew-data-advert", error);
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
    // console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// get boat server delete
app.get("/boat-service/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const objId = { _id: new ObjectId(id) };
    const result = await boatServiceOrderCollection.findOne(objId);
    res.status(200).send(result);
  } catch (error) {
    // console.log(error);
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
    // console.log(error);
    res.status(500).send({ message: "Server Broken!" });
  }
});

// post boat server
app.post("/boat-service", async (req, res) => {
  try {
    const body = req.body;
    const newData = {
      ...body,
      role: "boatServices",
    };
    const result = await boatServiceUserCls.insertOne(newData);
    res.send(result);
  } catch (error) {
    // console.log("boat-service", error);
    res.status(500).send({ message: "Server Broken" });
  }
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
    // console.log("boat-services-data", error);
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
    // console.log("boat-services-data", error);
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
    // console.log("boat-services-data", error);
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
    // console.log("boat-services-data", error);
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
    // console.log("boat-services-data", error);
    res.status(500).send({ message: "Server Broken" });
  }
});

// Update Boat Profile
app.patch("/update-boat-cover", async (req, res) => {
  const updateData = req.body;
  try {
    // Use findByIdAndUpdate to update the document

    const updateBoatCoverData = await boatsCollection.findOneAndUpdate(
      { email: updateData.email },
      {
        $set: {
          picture: updateData.url,
        },
      }
    );

    res.status(200).json(updateBoatCoverData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Update Boat Profile
app.patch("/update-boat-profile", async (req, res) => {
  // const attorneyId = req.params.id;
  const updateData = req.body;
  console.log("updateData", updateData);
  try {
    // Use findByIdAndUpdate to update the document

    const updateBoatData = await boatsCollection.findOneAndUpdate(
      { email: updateData.email },
      {
        $set: {
          identityPhoto: updateData.url,
        },
      }
    );

    res.status(200).json(updateBoatData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Update Boat Profile
app.patch("/boat/basic", async (req, res) => {
  // const attorneyId = req.params.id;
  const { email, fullName, nationality, phone, languages, description } =
    req.body;
  try {
    // Use findByIdAndUpdate to update the document

    const updateBoatDetails = await boatsCollection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fullName: fullName,
          nationality: nationality,
          phone: phone,
          languages: languages,
          description: description,
        },
      }
    );

    res.status(200).json(updateBoatDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/crew/basic", async (req, res) => {
  // const attorneyId = req.params.id;
  const {
    email,
    fullName,
    // nationality,
    phone,
    // languages,
    // description
  } = req.body;
  try {
    // Use findByIdAndUpdate to update the document

    const updateCrewDetails = await crewCollection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fullName: fullName,
          // nationality: nationality,
          phone: phone,
          // languages: languages,
          // description: description
        },
      }
    );

    res.status(200).json(updateCrewDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/boat-service/basic", async (req, res) => {
  const {
    email,
    fullName,
    // nationality,
    phone,
    // languages,
    // description
  } = req.body;
  try {
    // Use findByIdAndUpdate to update the document

    const updateCrewDetails = await boatServiceCollection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          fullName: fullName,
          // nationality: nationality,
          phone: phone,
          // languages: languages,
          // description: description
        },
      }
    );

    res.status(200).json(updateCrewDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// server listen or running
app.listen(port, () => {
  console.log(`anyVessel Server is running ${port}`);
});
