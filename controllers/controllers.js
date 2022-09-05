const { BODY_USER, SUCCESS_NOTI, BODY_VIDEO } = require("../variables/variables")
const shuffle = require('shuffle-array')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const { default: axios } = require("axios")
var ObjectId = require('mongodb').ObjectId

const routesController = {

    //Add Users
    addUsers: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10)
            const hashed = await bcrypt.hash(req.body.password, salt)
            const results = await dbo.collection("users").findOne({ username: req.body.username })
            if (!results) {
                await dbo.collection("users").insertOne(BODY_USER(req, hashed))
                res.json(SUCCESS_NOTI(uuidv4))
            }
            else {
                await dbo.collection("users").findOneAndUpdate({ username: req.body.username }, { $set: BODY_USER(req, hashed) })
                res.json(SUCCESS_NOTI(uuidv4))
            }
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //Newfeed
    newFeed: async (req, res) => {
        try {
            const as = [], arr = []
            const Array = await dbo.collection("videos").aggregate([{ $sample: { size: 10 } }]).toArray()
            for (const key in Array) {
                if (arr.indexOf(Array[key].username) < 0) {
                    await arr.push(Array[key].username)
                }
            }
            for (const key in arr) {
                const infoUsers = await dbo.collection("users").find({ username: arr[key] }).toArray()
                infoUsers[0].name && infoUsers[0].username
                const infoVideos = await dbo.collection("videos").find({ username: arr[key] }).toArray()
                for (const key in infoVideos) {
                    await as.push({ ...infoUsers[0], ...infoVideos[key] })
                }
            }

            as[0] ? await res.json(shuffle(as)) : res.json({ "status": "no data" })
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //list discover
    disCover: async (req, res) => {
        try {
            await dbo
                .collection("discover")
                .find()
                .toArray((err, obj) => {
                    if (err) throw err
                    if (obj.length != 0) res.json(obj)
                })
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //list suggest accounts
    suggestAccounts: async (req, res) => {
        try {
            await dbo
                .collection("users")
                .aggregate([{ $sample: { size: 5 } }])
                .toArray((err, obj) => {
                    if (err) throw err
                    if (obj.length != 0) res.json(obj)
                })
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //list following accounts
    followingAccounts: async (req, res) => {
        try {
            const result = await dbo.collection("users").aggregate([{ $sample: { size: 10 } }]).toArray()
            const filter = await result.filter((item) => {
                return item.following === true
            })
            if (result.length != 0) res.json(filter)
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //api post videos
    postVideos: async (req, res) => {
        try {
            const obj = await dbo.collection("users").find(req.body.username && { username: req.body.username }).toArray()
            if (obj.length != 0) {
                await dbo.collection("videos").insertOne(BODY_VIDEO(req))
                res.json(SUCCESS_NOTI(uuidv4))
            }
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //delete videos
    deleteVideos: async (req, res) => {
        try {
            const obj = await dbo.collection("videos").find({ _id: ObjectId(`${req.body._id}`) }).toArray()
            if (obj.length != 0) {
                await dbo.collection("videos").deleteOne({ _id: ObjectId(`${req.body._id}`) })
                await axios.post("https://cloudinary.com/console/api/v1/operations/delete", {
                    "external_ids": [`${req.body.asset_id}`]
                }, {
                    headers: {
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NjI0NzQ4MzgsImlzcyI6ImNvbnNvbGUiLCJpYXQiOjE2NjIzMDIwMzgsInVzZXJfaWQiOiJlMGNlMGVkMjhkMmFhMzljOWQ0NjQyODRmZTUzMTkzOSIsIm1ldGEiOnsiY2xkX2FkbWluIjpmYWxzZSwicm9sZSI6Im1hc3Rlcl9hZG1pbiIsImNsb3VkX25hbWUiOiJkbWI3b3g5dmgifSwiY3VzdG9tZXJfaWQiOiJiZjM5OGZiZWY2OWE3MmEwMzU1OGFkZjcxMTBlY2UzYyJ9.VR5B-ng4uyzSOIavSImjZJizXeiI0gLVO981yCoh__s"
                    }
                })
                res.status(200).json({
                    status: "success",
                    code_status: "200 OK"
                })
            }
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //detail accounts (followings, followers, likecount, bio...)
    detailAccounts: async (req, res) => {
        try {
            await dbo
                .collection("users")
                .find(req.body.username && { username: req.body.username })
                .toArray((err, obj) => {
                    if (err) throw err
                    if (obj.length != 0) {
                        res.json(obj)
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
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },


    //handle event following
    Following: async (req, res) => {
        try {
            newValue = { $set: { following: req.body.value } }
            await dbo.collection("users").updateOne({ username: req.body.username }, newValue)
            await dbo.collection("videos").updateOne({ username: req.body.username }, newValue)
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    },

    //handle event hearted
    Hearted: async (req, res) => {
        try {
            newValue = { $set: { heart_check: req.body.value } }
            await dbo.collection("videos").updateOne({ username: req.body.username }, newValue)
        } catch (error) {
            console.error(error.message)
            res.status(500).json(error.message)
        }
    }
}

module.exports = routesController