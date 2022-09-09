require('dotenv').config()
const MongoClient = require("mongodb").MongoClient
const router = require('express').Router()
const routesController = require('../controllers/controllers')

const mongo = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true })
mongo.connect(async (err, db) => {

    dbo = await db.db("f8_dev")

    router.get('/newfeed', routesController.newFeed)
    router.get('/discover', routesController.disCover)
    router.get('/suggestAccounts', routesController.suggestAccounts)
    router.get('/followingAccounts', routesController.followingAccounts)

    router.post('/addUsers', routesController.addUsers)
    router.post('/detailAccounts', routesController.detailAccounts)
    router.post('/following', routesController.Following)
    router.post('/postVideos', routesController.postVideos)
    router.post('/hearted', routesController.Hearted)
    router.post('/deleteVideos', routesController.deleteVideos)

})



module.exports = router



