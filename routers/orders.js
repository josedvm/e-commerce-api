const express = require('express')
const router = express.Router()
const {Order} = require('../models/order')

//get
router.get(`/`,async (req,res) =>{
    const orderList = await Order.find()
    if(!orderList){
        res.status(500).json({error:'something was wrong!'})
    }
    res.send(orderList)    
})

module.exports = router;