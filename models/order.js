const mongoose = require('mongoose')

/* scheme */
const orderScheme = mongoose.Schema({
    name: String,
    image: String,
    countInStock:{
        type: Number,
        required: true
    }
})

/* model */
exports.Order = mongoose.model('Order', orderScheme)