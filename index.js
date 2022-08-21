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
    dbo.collection("videos").aggregate([{ $sample: { size: 10 } }]).toArray((err, obj) => {
      if (err) throw err;
      if (obj.length != 0) {
        obj.map((item) => {
          dbo.collection("users").find({ username: item.username }).toArray((err, obj) => {
            if (err) throw err;
            if (obj.length != 0) {
              dbo.collection("videos").updateOne({ username: item.username }, {
                $set: {
                  live: obj[0].live,
                  blue_check: obj[0].blue_check,
                  name: obj[0].name,
                  username: obj[0].username,
                  count_followers: obj[0].count_followers,
                  count_likes: obj[0].count_likes,
                  bio: obj[0].bio,
                  following: obj[0].following,
                  avatar: obj[0].avatar
                }
              });
            }
          });
        })
        dbo.collection("videos").aggregate([{ $sample: { size: 10 } }]).toArray((err, obj) => {
          if (err) throw err;
          if (obj.length != 0) {
            res.json(obj);
          }
        })
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

  app.post("/api/post_videos", (req, res) => {
    dbo
      .collection("users")
      .find(req.body.username && { username: req.body.username })
      .toArray((err, obj) => {
        if (err) throw err;
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
          res.json('post success!');
        }
      })
  })

  app.post("/api/post_users", (req, res) => {
    dbo.collection("users").deleteOne({ username: req.body.username })
    dbo.collection("users").insertOne({
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
    res.json('post success!');
  })

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
            "name": "Fail Data",
            "username": "Fail Data",
            "count_followers": "0000000",
            "count_likes": "0000000",
          })
        }
      })
  });

  app.post("/api/following", (req, res) => {
    console.log(req.body.username, req.body.value);
    newValue = { $set: { following: req.body.value } };
    dbo.collection("users").updateOne({ username: req.body.username }, newValue);
    dbo.collection("videos").updateOne({ username: req.body.username }, newValue);
  });

  app.post("/api/hearted", (req, res) => {
    newValue = { $set: { heart_check: req.body.value } };
    dbo.collection("videos").updateOne({ username: req.body.username }, newValue);
  });
});

