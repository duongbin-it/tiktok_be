const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(process.env.PORT, () => { });
// app.listen(3002, () => { });


const mongo = new MongoClient("mongodb+srv://duongbinhnh:tungduonghj@cluster0.ubdfqnj.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
mongo.connect((err, db) => {
  if (err) throw err;
  const dbo = db.db("f8_dev");

  app.get("/api/newfeed", async (req, res) => {
    const as = [];
    const a = await dbo.collection("videos").aggregate([{ $sample: { size: 10 } }]).toArray()
    let ac = 4
    for (let i = ac; i >= 0; i--) {
      const currentItem = dbo.collection("users").find({ username: a[i].username }).toArray()
      Promise.all([currentItem]).then(result => {
        const arr1 = result[0][0]
        dbo.collection("videos").find({ username: arr1.username })
          .toArray((err, obj) => {
            as.push({ ...arr1, ...obj[0] });
            if (ac === 0) {
              res.json(as);
            }
            ac--
          })
      })
    }
  });

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
        .insertOne({
          ...obj[0],
          title: req.body.title,
          heart: req.body.heart,
          share: req.body.share,
          image: req.body.image,
          comment: req.body.comment,
          name_tag: req.body.name_tag,
          link_music: req.body.link_music,
          link_video: req.body.link_video,
          name_music: req.body.name_music,
          heart_check: req.body.heart_check,
        })
      res.json({
        "type": "video",
        "status": "200 OK",
        "messenger": "Successful video upload!",
        "uid_code_json": uuidv4()
      });
    }
  })

  app.post("/api/post_users", async (req, res) => {
    await dbo.collection("users").deleteOne({ username: req.body.username })
    await dbo.collection("users").insertOne({
      live: req.body.live,
      blue_check: req.body.blue_check,
      name: req.body.name,
      username: req.body.username,
      count_followers: req.body.count_followers,
      count_likes: req.body.count_likes,
      bio: req.body.bio,
      following: req.body.following,
      avatar: req.body.avatar
    })
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

