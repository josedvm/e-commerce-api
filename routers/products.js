const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/product");

//get
router.get(`/`, async (req, res) => {
	const productList = await Product.find();
	if (!productList) {
		res.status(500).json({ error: "something was wrong!" });
	}
	res.send(productList);
});

//post
router.post(`/`, async (req, res) => {
	const {
		name,
		description,
		richDescription,
		image,
		images,
		brand,
		price,
		category,
		countInStock,
		rating,
		numReviews,
		dateCreated,
		isFeatured,
	} = req.body;
	try {
		/* verified category */
		const findCategory = await Category.findById(category);
		if (!findCategory) return res.status(400).send(`Invalid category.`);

		let newProduct = new Product({
			name: name,
			description: description,
			richDescription: richDescription,
			image: image,
			images: images,
			brand: brand,
			price: price,
			category: category,
			rating: rating,
			numReviews: numReviews,
			dateCreated: dateCreated,
			isFeatured: isFeatured,
			countInStock: countInStock,
		});
		newProduct = await newProduct.save();
		if (!newProduct)
			return res.status(500).send("the product could not be created.");

		res.send(newProduct);
		/*  console.log({name,image,countInStock})
    newProduct.save().then(createdProduct => {
        res.status(201).json(createdProduct)
    }).catch(err =>{
        res.status(500).json({
            error:err,
            success:false
        })
    }) */
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
	}
});

module.exports = router;
