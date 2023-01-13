const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const serviceRoute = require("./src/routes/services.routes");

const app = express();
var port = process.env.PORT || 9000;


app.use(cors());
app.use(express.json());

app.use("/service", serviceRoute);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfsubck.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorize Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('doctors_portal').collection('services');
        const bookingCollection = client.db('doctors_portal').collection('bookings');
        const userCollection = client.db('doctors_portal').collection('users');



        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ eail: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        app.get('/available', async (req, res) => {
            const date = req.query.date || 'January 8, 2023';


            //step 1: get all services
            const services = await serviceCollection.find().toArray();

            //Step 2: get the booking of that day
            const query = { date: date };
            const bookings = await bookingCollection.find(query).toArray();


            services.forEach(
                service => {
                    const serviceBookings = bookings.filter(b => b.treatment === service.name);
                    const booked = serviceBookings.map(s => s.slot);
                    const available = service.Slots.filter(s => !booked.includes(s));
                    service.available = available;


                })

            res.send(services);
        })


        /****** API Naming Convention ******
             *  app.get('/booking') //get all bookings in this collections. or get more than one
             *  app.get('/booking/id') // get a specific booking
             *  app.post('/booking')// add a new booking
             *  app.patch('/booking/:id) //
             *  app.delete('/booking/:id) //
            ***/

        // app.get('/booking', verifyJWT, async (req, res) => {
        //     const patient = req.query.patient;
        //     const decodedEmail = req.decoded.email;
        //     if (patient === decodedEmail) {
        //         const query = { patient: patient };
        //         const bookings = await bookingCollection.find(query).toArray();
        //         return res.send(bookings);
        //     }
        //     else {
        //         return res.status(403).send({ message: 'forbidden access' });
        //     }

        // })


        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({ success: true, result });
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