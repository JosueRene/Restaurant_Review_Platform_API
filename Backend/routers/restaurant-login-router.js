const router = require('express').Router()
const { Restaurant } = require('../models/restaurant-model')
const bcrypt = require('bcrypt')
const joi = require('joi')


router.route('/login').post(async(req, res) => {
    try {
        const { error } = validate(req.body)
        if(error) {
            return res.status(500).json({ message: "Error Occured!", error: error.details[0].message })
        }

        const restaurant = await Restaurant.findOne({ restaurantEmail: req.body.restaurantEmail })
        if(!restaurant) {
            return res.status(400).json({ message: "Invalid Email!" })
        }

        const comparepassword = await bcrypt.compare( req.body.restaurantPassword, restaurant.restaurantPassword )
        if(!comparepassword) {
            return res.status(400).json({message: "Invalid Password"})
        }

        const token = restaurant.generateAuthToken()

        res.cookie('AuthToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        })

        return res.status(200).json({data: token, message: "Restaurant LoggedIn!", redirectUrl: '/restaurant_review_platform/restaurant-dashboard'})
                
    } catch (error) {
        console.error("Error Occured!", error)
        return res.status(500).json({message: "Something Went Wrong!", error: error.message})
    }
})

const validate = (data) => {
    const schema = joi.object({
        restaurantEmail: joi.string().email().required().label("RestaurantEmail"),
        restaurantPassword: joi.string().required().label("RestaurantPassword")
    })

    return schema.validate(data)
}

module.exports = router