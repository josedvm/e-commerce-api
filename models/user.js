const mongoose = require('mongoose')

/* scheme */
const userScheme = mongoose.Schema({
    name: String,
    image: String,
    countInStock:{
        type: Number,
        required: true
    }
})

/* model */
exports.User = mongoose.model('User', userScheme)