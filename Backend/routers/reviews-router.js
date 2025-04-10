const router = require('express').Router()
const Review = require('../models/reviews-model')
const { Restaurant } = require('../models/restaurant-model')
const axios = require('axios')
const Redis = require('ioredis')

const redis = new Redis()

/***** User or Clients Can Access The Below Routes Only! *****/
router.route('/reviews').get(async(req, res) => {
    try {
        
        const reviews = await Review.find().populate('restaurantId', 'restaurantName restaurantEmail')
        if(!reviews.length) {
            return res.status(400).json({message: "No Reviews Found!"})
        }

        return res.status(200).json({message: "All Reviews Retrieved!", reviews})

    } catch (error) {
        console.error("Error Occured!", error.message)
        return res.status(500).json({ message: "Error Occured!", error: error.message })
    }
})

router.route('/reviews/leaderboard').get(async(req, res) => {
    try {
        
        const leaderboard = await redis.zrevrange('restaurant_leaderboard', 0, 9, 'WITHSCORES')

        const leaderboardArray = [];
        for (let i = 0; i < leaderboard.length; i += 2) {
            leaderboardArray.push({
                restaurantId: leaderboard[i],
                score: parseFloat(leaderboard[i + 1])
            })
        }

        return res.status(200).json({message: "Leaderboard Retrieved!", leaderboardArray})

    } catch (error) {
        console.error("Failed To Retrieve Leaderboard!", error.message)
        return res.status(500).json({message: "Failed To Retrieve Leaderboard!", error: error.message })
    }
})

router.route('/reviews/:restaurantId').get(async(req, res) => {
    const { restaurantId } = req.params

    try {

        const restaurant = await Restaurant.findOne({ _id: restaurantId })
        if(!restaurant) {
            return res.status(404).json({message: "Restaurant Not Found!"})
        }

        const reviews = await Review.find({ restaurantId }).populate('restaurantId', 'restaurantName restaurantEmail')

        if(!reviews.length) {
            return res.status(400).json({message: "No Reviews Found!"})
        }

        return res.status(200).json({ message:"Reviews Retrieved!", reviews })

    } catch (error) {
        console.error("Error Occured!", error.message)
        return res.status(500).json({ message: "Error Occured!", error: error.message })
    }

})

router.route('/reviews/add').post(async(req, res) => {
    const { clientName, clientEmail, restaurantId, clientReview } = req.body

    try {
        
        const restaurant = await Restaurant.findOne({ _id: restaurantId })
        if(!restaurant) {
            return res.status(404).json({message: "Restaurant Not Found!"})
        }

        // Send review to the python NLP Service
        const response = await axios.post('http://127.0.0.1:5001/analyze', {review: clientReview} )
        const sentimentScore = response.data.sentiment_score;

        await new Review({ clientName, clientEmail, restaurantId, clientReview }).save()

        // Update the Redis Leaderboard (ZADD)
        await redis.zincrby('restaurant_leaderboard', sentimentScore, restaurantId)

        return res.status(200).json({message: "Your Restaurant Review is Added!", sentimentScore})

    } catch (error) {
        console.error("Error Occured!", error.message)
        return res.status(500).json({message: "Error Occured!", error: error.message})
    }

})


/***** Restaurants (or their admins) Can Access The Below Routes */


module.exports = router