const mongoose = require('mongoose')

/* scheme */
const productScheme = mongoose.Schema({
    name: String,
    image: String,
    countInStock:{
        type: Number,
        required: true
    }
})

/* model */
exports.Product = mongoose.model('Product', productScheme)