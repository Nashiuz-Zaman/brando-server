const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.ejmezk0.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const database = client.db("assignment10");
    const brands = database.collection("brands");

    // api for getting the brand ads
    app.get("/brands/:id", async (req, res) => {
      // extract route parameter
      const id = req.params.id;
      // build the search query
      const query = { brandName: id };
      // find according to the search query
      const result = await brands.findOne(query);
      // send to client side
      res.send(result);
    });

    // api for getting products for specific brands
    app.get("/brands/:id/products", async (req, res) => {
      // extract route parameter
      const id = req.params.id;
      // select collection according to the parameter
      const collection = database.collection(`${id}`);
      // make cursor
      const cursor = collection.find();
      // return an array of all the results found
      const result = await cursor.toArray();
      // send data to client side
      res.send(result);
    });

    // api for adding products to specific brands
    app.post("/brands/:id/products", async (req, res) => {
      // extract route parameter
      const id = req.params.id;
      // extract data to be added to database
      const item = req.body;
      // select collection based on route parameter
      const collection = database.collection(`${id}`);
      // insert to collecton
      const result = await collection.insertOne(item);
      // send to client side
      res.send(result);
    });

    // api for getting single product
    app.get("/brands/:brandId/products/:productId", async (req, res) => {
      const brandId = req.params.brandId;
      const productId = req.params.productId;

      const collection = database.collection(`${brandId}`);
      const objectId = new ObjectId(productId);
      const query = { _id: objectId };

      const result = await collection.findOne(query);
      res.send(result);
    });

    // api for setting single product
    app.put("/brands/:brandId/products/update/:productId", async (req, res) => {
      //  get the brand and the product
      const brandId = req.params.brandId;
      const productId = req.params.productId;
      // get the collection
      const collection = database.collection(`${brandId}`);
      const objectId = new ObjectId(productId);
      // build the query
      const filter = { _id: objectId };

      // set the upsert option to true
      const options = { upsert: true };
      // get the updated product from request body
      const updatedProduct = req.body;

      // create the updated information
      const updateDoc = {
        $set: updatedProduct,
      };
      // update the document and send result
      const result = await collection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // api for adding to overall cart
    app.post("/cart/add", async (req, res) => {
      const item = req.body;
      const collection = database.collection("cart");
      const result = await collection.insertOne(item);
      res.send(result);
    });

    // api for search specific email's cart products
    app.post("/cart", async (req, res) => {
      // retrieve the email from the body
      const email = req.body.email;
      const collection = database.collection("cart");
      // make the query
      const query = { addedBy: email };
      // get the cursor
      const cursor = collection.find(query);
      // conver to array
      const result = await cursor.toArray();
      // send the result
      res.send(result);
    });

    // api to delete specific cart product
    app.delete("/cart/:id", async (req, res) => {
      //retrieve the id
      const item = req.params.id;
      const objectId = new ObjectId(item);
      //  build the query
      const filter = { _id: objectId };
      // get the collection
      const collection = database.collection("cart");
      // delete the document
      const result = await collection.deleteOne(filter);
      // send the result
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
