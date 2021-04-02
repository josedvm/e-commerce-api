const express = require('express')
const router = express.Router()
const {Product} = require('../models/product')

//get
router.get(`/`,async (req,res) =>{
    const productList = await Product.find()
    if(!productList){
        res.status(500).json({error:'something was wrong!'})
    }
    res.send(productList)    
})

//post
router.post(`/`,(req,res) =>{
    const {name, image, countInStock} = req.body
    const newProduct = new Product({
        name:name,
        image:image,
        countInStock:countInStock
    })
    console.log({name,image,countInStock})
    newProduct.save().then(createdProduct => {
        res.status(201).json(createdProduct)
    }).catch(err =>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})

module.exports = router;