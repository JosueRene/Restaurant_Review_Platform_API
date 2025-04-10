const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    clientEmail: {
        type: String,
        required: false
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    clientReview: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review