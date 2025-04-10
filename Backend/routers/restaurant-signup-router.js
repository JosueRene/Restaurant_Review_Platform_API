const router = require('express').Router()
const { Restaurant, validate } = require('../models/restaurant-model')
const bcrypt = require('bcrypt')

router.route('/signup').post(async(req, res) => {
    try {
        const { error } = validate(req.body)
        if(error) {
            return res.status(500).json({message: "Error Occured!", error: error.message.details[0]})
        }

        const restaurant = await Restaurant.findOne({ restaurantEmail: req.body.restaurantEmail })
        if(restaurant) {
            return res.status(400).json({message: "Restaurant With This Email Already Exist!"})
        }

        const saltpassword = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(req.body.restaurantPassword, saltpassword)
        
        await new Restaurant({ ...req.body, restaurantPassword: hashpassword }).save()
        return res.status(200).json({message: "New Restaurant Registered!"})
        
    } catch (error) {
        console.error("Error Occured!", error)
        return res.status(500).json({message: "Error Occured!", error: error.message})
    }
})

module.exports = router