const cors = require("cors")
const express = require("express")
const app = express()
const router = require("./routes/router")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.listen(process.env.PORT || 3001, () => { })




app.use('/api', router)

