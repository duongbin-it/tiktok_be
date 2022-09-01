require('dotenv').config()
const MongoClient = require("mongodb").MongoClient
const router = require('express').Router()
const routesController = require('../controllers/controllers')

const mongo = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true })
mongo.connect(async (err, db) => {
    dbo = await db.db("f8_dev")
    router.get('/newfeed', routesController.newFeed)
    router.get('/discover', routesController.disCover)
    router.get('/suggest_accounts', routesController.suggestAccounts)
    router.get('/following_accounts', routesController.followingAccounts)

    router.post('/add_users', routesController.addUsers)
    router.post('/detail_accounts', routesController.detailAccounts)
    router.post('/following', routesController.Following)
    router.post('/post_videos', routesController.postVideos)
    router.post('/hearted', routesController.Hearted)
})



module.exports = router



