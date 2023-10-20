const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, Collection } = require("mongodb");
const uri =
  "mongodb+srv://nashiuzzaman:1HjxrmzdkRpqx2Cy@cluster0.ejmezk0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("assignment10");
    const brands = database.collection("brands");

    // api for getting the brand ads
    app.get("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const query = { brandName: id };
      const result = await brands.findOne(query);
      res.send(result);
    });

    // api for getting products for specific brands
    app.get("/brands/:id/products", async (req, res) => {
      const id = req.params.id;
      const collection = database.collection(`${id}`);
      const cursor = collection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("server running perfectly");
});

app.listen(port);
