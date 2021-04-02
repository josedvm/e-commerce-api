const express = require('express')
const router = express.Router()
const {Category} = require('../models/category')

//get
router.get(`/`,async (req,res) =>{
    const categoryList = await Category.find()
    if(!categoryList){
        res.status(500).json({error:'something was wrong!'})
    }
    res.send(categoryList)    
})

module.exports = router;