const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require("express");
const app = express();
app.use(cors());
var port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://doctors_Admin:OC44EWVZAtEdVzGP@cluster0.kfsubck.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('doctors_portal').collection('services');

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            response.send(services);


        })
    }
    finally {

    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From Doctor Uncle !')
})

app.listen(port, () => {
    console.log(`Doctors App Listening on port  ${port}`);
});