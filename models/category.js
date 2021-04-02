const mongoose = require('mongoose')

/* scheme */
const categoryScheme = mongoose.Schema({
    name: String,
    image: String,
    countInStock:{
        type: Number,
        required: true
    }
})

/* model */
exports.Category = mongoose.model('Category', categoryScheme)