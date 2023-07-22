require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT;
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxopl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("my-book");
    const bookCollection = db.collection("my-book");
    mongoose.connect(uri);

    app.get("/products", async (req, res) => {
      const limit = 10;
      const products = await bookCollection.find().limit(limit).toArray();
      res.send({ status: true, data: products });
    });
    app.post("/product", async (req, res) => {
      const product = req.body;

      const result = await bookCollection.insertOne(product);

      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await bookCollection.findOne({
          _id: new ObjectId(id),
        });
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });

    app.post("/comment/:id", async (req, res) => {
      const productId = req.params.id;
      const comment = req.body.comment;

      console.log(productId);
      console.log(comment);

      const result = await bookCollection.updateOne(
        { _id: ObjectId(productId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/comment/:id", async (req, res) => {
      const productId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(productId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello mushkil");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
