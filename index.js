const express = require("express");
const shuffle = require('shuffle-array')
const app = express();
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const { BODY_USER, BODY_VIDEO } = require('./variables');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(process.env.PORT || 3001, () => { });


const mongo = new MongoClient("mongodb+srv://duongbinhnh:tungduonghj@cluster0.ubdfqnj.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
mongo.connect((err, db) => {
  if (err) throw err;
  const dbo = db.db("f8_dev");

  app.get("/api/newfeed", async (req, res) => {
    const as = [];
    const arr = []
    const Array = await dbo.collection("videos").aggregate([{ $sample: { size: 10 } }]).toArray()
    for (const key in Array) {
      if (arr.indexOf(Array[key].username) < 0) {
        await arr.push(Array[key].username);
      }
    }
    for (const key in arr) {
      const infoUsers = await dbo.collection("users").find({ username: arr[key] }).toArray()
      const infoVideos = await dbo.collection("videos").find({ username: arr[key] }).toArray()
      for (const key in infoVideos) {
        await as.push({ ...infoUsers[0], ...infoVideos[key] });
      }
    }
    await res.json(shuffle(as));
  })

  app.get("/api/discover", async (req, res) => {
    await dbo
      .collection("discover")
      .find()
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) res.json(obj);
      });
  });

  app.get("/api/suggest_acounts", async (req, res) => {
    await dbo
      .collection("users")
      .aggregate([{ $sample: { size: 10 } }])
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) res.json(obj);
      });
  });

  app.post("/api/post_videos", async (req, res) => {
    const obj = await dbo.collection("users").find(req.body.username && { username: req.body.username }).toArray()
    if (obj.length != 0) {
      dbo
        .collection("videos")
        .insertOne(BODY_VIDEO(req))
      res.json({
        "type": "video",
        "status": "200 OK",
        "messenger": "Successful video upload!",
        "uid_code_json": uuidv4()
      });
    }
  })

  app.post("/api/post_users", async (req, res) => {
    const findUser = await dbo.collection("users").findOne({ username: req.body.username })
    try {
      if (findUser._id) {
        await dbo.collection("users").findOneAndUpdate({ username: req.body.username }, { $set: BODY_USER(req) })
      }
    } catch (error) {
      await dbo.collection("users").insertOne(BODY_USER(req))
    }

    res.json({
      "type": "user",
      "status": "200 OK",
      "messenger": "Successful video upload!",
      "uid_code_json": uuidv4()
    });
  })

  app.post("/api/users", async (req, res) => {
    await dbo
      .collection("users")
      .find(req.body.username && { username: req.body.username })
      .toArray((err, obj) => {
        if (err) throw err;
        if (obj.length != 0) {
          res.json(obj);
        }
        else {
          res.json({
            "name": "Fail Data",
            "username": "Fail Data",
            "count_followers": "0000000",
            "count_likes": "0000000",
          })
        }
      })
  });

  app.post("/api/following", async (req, res) => {
    newValue = { $set: { following: req.body.value } };
    await dbo.collection("users").updateOne({ username: req.body.username }, newValue);
    await dbo.collection("videos").updateOne({ username: req.body.username }, newValue);
  });

  app.post("/api/hearted", async (req, res) => {
    newValue = { $set: { heart_check: req.body.value } };
    await dbo.collection("videos").updateOne({ username: req.body.username }, newValue);
  });
});

