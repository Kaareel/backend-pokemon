require("dotenv").config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const dbConnect = require('./config/mongo')
const userRouters = require('./routes/pokemons')

app.use(bodyParser.json({
    limit: '100mb'
}))
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
})
)

app.use(cors())

const port = process.env.PORT || 3000

app.use(userRouters)

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
    dbConnect()
} else {
    console.log('Running in test mode - database will be handled by test helper')
}

module.exports = app