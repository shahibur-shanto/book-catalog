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

    app.get("/", async (req, res) => {
      const limit = 10;
      const books = await bookCollection.find().limit(limit).toArray();
      res.send({ status: true, data: books });
    });

    app.get("/search/:searchText", async (req, res) => {
      const searchString = req.params.searchText;
      const books = await bookCollection
        .find({
          $or: [
            { title: { $regex: searchString, $options: "i" } },
            { genre: { $regex: searchString, $options: "i" } },
            { author: { $regex: searchString, $options: "i" } },
          ],
        })
        .toArray();
      res.send({ status: true, data: books });
    });

    app.get("/allbooks", async (req, res) => {
      // console.log("allbooks");
      const books = await bookCollection.find().toArray();
      res.send({ status: true, data: books });
    });
    app.post("/create-book", async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    app.put("/book-edit/:id", async (req, res) => {
      const updateBook = req.body;
      console.log(updateBook);
      const BookId = req.params.id;
      const result = await bookCollection.updateOne(
        { _id: new ObjectId(BookId) },
        {
          $set: updateBook,
        },
        {
          new: true,
        }
      );

      res.send(result);
    });

    app.put("/review/:id", async (req, res) => {
      const BookId = req.params.id;
      const reviews = req.body.reviews;

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(BookId) },
        {
          $push: { reviews },
        }
      );

      if (result.modifiedCount !== 1) {
        // console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      // console.log("Comment added successfully");
      res.json({ message: "Review added successfully" });
    });

    app.get("/book-details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const book = await bookCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(book);
      } catch (error) {
        // console.log(error);
      }
    });

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      if (!ObjectId.isValid(id)) {
        console.log("Invalid book ID format");
        res.status(400).json({ error: "Invalid book ID format" });
        return;
      }
      const book = await bookCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (book.deletedCount === 0) {
        console.log("book not deleted successfully");
        res.status(404).json({ error: "Book not found" });
      } else {
        console.log("book deleted successfully");
        res.json({ message: "Book deleted successfully" });
      }
    });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(id) },
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
