const mongoose = require('mongoose')

/* scheme */
const categoryScheme = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    color: {
        type: String
    },
    icon: {
        type: String
    },
    image: {
        type: String,
        default :''
    }
    
})

/* model */
exports.Category = mongoose.model('Category', categoryScheme)