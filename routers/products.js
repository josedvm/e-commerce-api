const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/product");

//get all products
router.get(`/`, async (req, res) => {
	const productList = await Product.find().populate("category"); //Product.find().select("name image -_id") para solo mostrar los campos que quiero
	if (!productList) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send(productList);
});

//get one product by id
router.get(`/:id`, async (req, res) => {
	try {
		//.populate('category') -> cualquier campo conectado a otra coleccion mostrara la informacion
		const product = await Product.findById(req.params.id).populate("category");
		if (!product) {
			return res.status(500).json({ error: "Product not found!" });
		}
		res.send(product);
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
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
