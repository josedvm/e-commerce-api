const mongoose = require('mongoose')

/* scheme */
const productScheme = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default :''
    },
    image: {
        type: String,
        default :''
    },
    images: [{
        type: String        
    }],
    brand: {
        type: String,
        default :''
    },
    price:{
        type: Number,
        default: 0
    },
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default :0
    },
    numReviews: {
        type: Number,
        default :0
    },
    dateCreated: {
        type: Date,
        default :Date.now
    },
})

/* model */
exports.Product = mongoose.model('Product', productScheme)