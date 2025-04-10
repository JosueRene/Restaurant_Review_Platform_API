const mongoose = require('mongoose')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const passwordComplexity = require('joi-password-complexity')

const restaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        unique: true
    },
    restaurantEmail: {
        type: String,
        required: true,
        unique: true
    },
    restaurantPassword: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
})

restaurantSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, process.env.PRIVATEKEY, {expiresIn: '1d'})
    return token
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

const validate = (data) => {
    const schema = joi.object({
        restaurantName: joi.string().required().label("RestaurantName"),
        restaurantEmail: joi.string().email().required().label("RestaurantEmail"),
        restaurantPassword: passwordComplexity().required().label("RestaurantPassword")
    })

    return schema.validate(data)
}

module.exports = { Restaurant, validate }