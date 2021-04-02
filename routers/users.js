const express = require('express')
const router = express.Router()
const {User} = require('../models/user')

//get
router.get(`/`,async (req,res) =>{
    const userList = await User.find()
    if(!userList){
        res.status(500).json({error:'something was wrong!'})
    }
    res.send(userList)    
})

module.exports = router;