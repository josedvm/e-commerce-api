const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");

// tipos validos de imagenes
const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
};
// destino de las imagenes que se suben y poner un nmbre a la imagen que no se repita
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValidExtension = FILE_TYPE_MAP[file.mimetype];
		let uploadError = new Error("Invalid image type.");
		if (isValidExtension) uploadError = null;
		cb(uploadError, "public/uploads");
	},
	filename: function (req, file, cb) {
		//tomar la extension de la imagen
		const extension = FILE_TYPE_MAP[file.mimetype];
		//const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const filename = file.originalname.split(" ").join("-");
		//cb(null, file.fieldname + "-" + uniqueSuffix);
		cb(null, `${filename}-${Date.now()}.${extension}`);
	},
});
//usar las opciones de upload antes creadas
const uploadOptions = multer({ storage: storage });

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

//post - se usa multer para subir la imagen
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
	const {
		name,
		description,
		richDescription,
		//image,
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

		//verificar que se haya mandado imagen
		const file = req.file;
		if (!file) return res.status(400).send(`No image in the product`);

		//se toma el nombre de la imagen
		const filename = req.file.filename;
		//se toma la ruta base para concatenar con la imagen
		const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

		let newProduct = new Product({
			name: name,
			description: description,
			richDescription: richDescription,
			image: `${basePath}${filename}`,
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

//put -update galery images of a product by id
router.put(
	"/gallery-images/:id",
	uploadOptions.fields([{ name: "images", maxCount: 3 }]), //or .array("images",3)
	async (req, res) => {
		if (!mongoose.isValidObjectId(req.params.id))
			return res.status(400).send("Invalid id of product");

		try {
			//verificar si hay imagenes
			let files = req.files.images;

			if (!files) {
				return res.status(400).send("Images to update not found.");
			}
			//se toma la ruta base para concatenar con la imagen
			const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

			let imagesPaths = files.map((file) => {
				return `${basePath}${file.filename}`;
			});
			console.log(imagesPaths);

			let productToUpdate = await Product.findByIdAndUpdate(
				req.params.id,
				{
					images: imagesPaths,
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
	}
);

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
