const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/product");
const mongoose = require("mongoose");

//get all products rith or without query
router.get(`/`, async (req, res) => {
	/* query case  http://localhost:3000/api/v1/products?categories=1223,2545*/
	let filter = {};
	if (req.query.categories) {
		filter = { category: req.query.categories.split(",") };
	}

	const productList = await Product.find(filter).populate("category"); //Product.find().select("name image -_id") para solo mostrar los campos que quiero
	if (!productList) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send(productList);
});

//get one product by id
router.get(`/:id`, async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id))
			return res.status(400).send("Invalid id of product");

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
			dateCreated: dateCreated || Date.now(),
			isFeatured: isFeatured,
			countInStock: countInStock,
		});
		newProduct = await newProduct.save();
		if (!newProduct)
			return res.status(500).send("the product could not be created.");

		res.send(newProduct);
		/*  //sin async-await
		console.log({name,image,countInStock})
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

//put -update product
router.put("/:id", async (req, res) => {
	if (!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send("Invalid id of product");
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

		let productToUpdate = await Product.findByIdAndUpdate(
			req.params.id,
			{
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
				dateCreated: dateCreated || Date.now(),
				isFeatured: isFeatured,
				countInStock: countInStock,
			},
			{
				new: true, //mostrar la nueva info
			}
		);

		if (!productToUpdate)
			return res.status(500).send("the product could not be updated.");

		res.send(productToUpdate);
	} catch (error) {
		res.status(400).json({ success: false, error: err.message });
	}
});

//delete
router.delete("/:id", (req, res) => {
	//validate id
	if (!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send("Invalid id of product");

	Product.findByIdAndRemove(req.params.id)
		.then((product) => {
			if (product) {
				return res.status(200).json({
					succes: true,
					message: `Product with the id: ${req.params.id} deleted.`,
				});
			} else {
				return res
					.status(404)
					.json({ succes: false, message: `Product not found.` });
			}
		})
		.catch((err) => {
			return res.status(400).json({ succes: false, error: err });
		});
});

//count products
router.get(`/get/count`, async (req, res) => {
	const productCount = await Product.countDocuments((count) => count);
	if (!productCount) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send({ count: productCount });
});

//get all featured products
router.get(`/get/featured`, async (req, res) => {
	const products = await Product.find({ isFeatured: true });
	if (!products) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send(products);
});

//get a number of featured products
router.get(`/get/featured/:count`, async (req, res) => {
	const count = req.params.count ? Number(req.params.count) : 0;
	const products = await Product.find({ isFeatured: true }).limit(count);
	if (!products) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send(products);
});

module.exports = router;
