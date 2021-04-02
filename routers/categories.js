const express = require('express')
const router = express.Router()
const {Category} = require('../models/category')
const { route } = require('./products')

//get
router.get(`/`,async (req,res) =>{
    const categoryList = await Category.find()
    if(!categoryList){
        res.status(500).json({error:'something was wrong!'})
    }
    res.send(categoryList)    
})

//post 
router.post('/', async(req, res) =>{
    let newCategory = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        image: req.body.image
    })
    newCategory = await newCategory.save()
    if(!newCategory)
    return res.status(500).send('the category could not be created.')

    res.send(newCategory)
})

//delete
router.delete('/:id', (req, res) =>{
    Category.findByIdAndRemove(req.params.id)
    .then(category =>{
        if(category){
            return res.status(200).json({succes:true,message:`Category with the id: ${req.params.id} deleted.`})
        }else{
            return res.status(404).json({succes:false,message:`Category not found.`})
        }
    }).catch(err => {
        return res.status(400).json({succes:false ,error:err})
    })

    })


module.exports = router;