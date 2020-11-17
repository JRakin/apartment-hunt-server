const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const port = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.DB_PASS}@cluster0.ibcuh.mongodb.net/apartmentHunt?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const apartmentCollection = client
    .db('apartmentHunt')
    .collection('apartments');

  const bookingsCollection = client.db('apartmentHunt').collection('bookings');

  app.post('/addAll', (req, res) => {
    apartmentCollection.insertMany(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/getAll', (req, res) => {
    apartmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get('/getApartment/:id', (req, res) => {
    apartmentCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        // console.log(documents);
        res.send(documents[0]);
      });
  });

  app.post('/addApartment', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const location = req.body.location;
    const bath = req.body.bath;
    const price = req.body.price;
    const bed = req.body.bed;

    const newImg = req.files.file.data;
    const encodedImg = newImg.toString('base64');

    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encodedImg, 'base64'),
    };

    apartmentCollection
      .insertOne({ name, location, bath, price, bed, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post('/addBooking', (req, res) => {
    bookingsCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get('/getAllBookings', (req, res) => {
    bookingsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // app.get('/getAllUserBooking/:email', (req, res) => {
  //   bookingsCollection
  //     .find({ email: req.params.email })
  //     .toArray((err, documents) => {
  //       res.send(documents);
  //     });
  // });

  app.patch('/updateBooking/:id', (req, res) => {
    bookingsCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });
  console.log('connected....');

  app.get('/', (req, res) => {
    res.send('hello from the other side');
  });
});

app.listen(port, () => {
  console.log('listening....');
});
