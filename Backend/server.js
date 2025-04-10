const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
// app.use(bodyParser.json())

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const cors = require('cors')
app.use(cors())

require('dotenv').config({path: "config.env"})

const connectDB = require('./models/database')
connectDB()

const signupRouter = require('./routers/restaurant-signup-router')
const loginRouter = require('./routers/restaurant-login-router')
const reviewRouter = require('./routers/reviews-router')


app.use('/restaurant_review_platform/account', signupRouter)
app.use('/restaurant_review_platform/account', loginRouter)
app.use('/restaurant_review_platform/', reviewRouter)

app.listen(PORT, ()=> {
    console.log(`Server Is Running on PORT ${PORT}`)
})