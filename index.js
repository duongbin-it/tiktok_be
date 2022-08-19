const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(process.env.PORT, () => { });
// app.listen(3001, () => { });


const mongo = new MongoClient("mongodb+srv://duongbinhnh:tungduonghj@cluster0.ubdfqnj.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
mongo.connect((err, db) => {
  if (err) throw err;
  const dbo = db.db("f8_dev");


  app.get("/api/newfeed", (req, res) => {
    dbo
      .collection("courses")
      .find()
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) {
          res.json(obj);
        }
      });
  });

  app.get("/api/discover", (req, res) => {
    dbo
      .collection("discover")
      .find()
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) {
          res.json(obj);
        }
      });
  });

  app.get("/api/suggest_acounts", (req, res) => {
    dbo
      .collection("users")
      .aggregate([{ $sample: { size: 10 } }])
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) {
          res.json(obj);
        }
      });
  });

  app.post("/api/users", (req, res) => {
    dbo
      .collection("users")
      .find(req.body.username && { username: req.body.username })
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) {
          res.json(obj);
        }
        else {
          res.json({
            "_id": "62fe3f60725e46fae8cc8bdc",
            "live": false,
            "blue_check": false,
            "name": "Fail Data",
            "username": "Fail Data",
            "count_followers": "0M",
            "count_likes": "0M",
            "bio": "Fail Data",
            "following": false,
            "image": "https://i.ibb.co/J2pck6h/1.jpg"
          })
        }
      });
  });

  app.post("/api/following", (req, res) => {
    console.log(req.body.username, req.body.value);
    newValue = { $set: { following: req.body.value } };
    dbo.collection("users").updateOne({ username: req.body.username }, newValue);
    dbo.collection("courses").updateOne({ username: req.body.username }, newValue);
  });

  app.post("/api/hearted", (req, res) => {
    newValue = { $set: { heart_check: req.body.value } };
    dbo.collection("courses").updateOne({ username: req.body.username }, newValue);
  });
});

