const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

mongoose.set("useFindAndModify", false);

//get
router.get(`/`, async (req, res) => {
	const userList = await User.find().select("-passwordHash"); //no mostrar passwordhash
	if (!userList) {
		res.status(500).json({ error: "user not found!" });
	}
	res.send(userList);
});

//get one user by id
router.get(`/:id`, async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id))
			return res.status(400).send("Invalid id of user");

		const user = await User.findById(req.params.id).select("-passwordHash"); //no mostrar passwordhash;
		if (!user) {
			return res.status(500).json({ error: "something was wrong!" });
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(400).json({ success: false, error: error.message });
	}
});

//count users
router.get(`/get/count`, async (req, res) => {
	const userCount = await User.countDocuments((count) => count);
	if (!userCount) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send({ count: userCount });
});

//post - crear un usuario como admin
router.post("/", async (req, res) => {
	const {
		name,
		email,
		password,
		phone,
		street,
		apartment,
		zip,
		city,
		country,
		isAdmin,
	} = req.body;
	let newUser = new User({
		name,
		email,
		passwordHash: bcrypt.hashSync(password, 10),
		phone,
		street,
		apartment,
		zip,
		city,
		country,
		isAdmin,
	});
	newUser = await newUser.save();
	if (!newUser) return res.status(500).send("the user could not be created.");

	res.send(newUser);
});

//post - registarse como usuario
router.post("/register", async (req, res) => {
	const {
		name,
		email,
		password,
		phone,
		street,
		apartment,
		zip,
		city,
		country,
		isAdmin,
	} = req.body;
	let newUser = new User({
		name,
		email,
		passwordHash: bcrypt.hashSync(password, 10),
		phone,
		street,
		apartment,
		zip,
		city,
		country,
		isAdmin,
	});
	newUser = await newUser.save();
	if (!newUser) return res.status(500).send("the user could not be created.");

	res.send(newUser);
});

//login
router.post("/login", async (req, res) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return res.status(400).send("user not found");
	console.log({ user });
	//validar contaseña con bcrypt
	if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
		// se crrea el token para enviar al usuario
		const secret = process.env.secret;
		const token = jwt.sign(
			{
				userId: user.id,
				isAdmin: user.isAdmin,
			},
			secret //se usa para crear el token
			/* , {expireIn : "1id"} ejemplo de tiempo de expiracion del token */
		);
		res.status(200).send({ user: user.email, token });
	} else {
		res.status(400).send("wrong password");
	}
});

//put - modificar un usuario, si entrega nueva contraseña se asigna, sino entrega contraseña se asigna la anterior
router.put("/:id", async (req, res) => {
	try {
		//validar id
		if (!mongoose.isValidObjectId(req.params.id))
			return res.status(400).send("Invalid id of user");

		const findUser = await User.findById(req.params.id);
		let newPassword;

		console.log(
			`el campo contraseña es este ${req.body.password}, la contraseña antigua es esta ${findUser.passwordHash}`
		);
		req.body.password
			? (newPassword = bcrypt.hashSync(req.body.password, 10))
			: (newPassword = findUser.passwordHash);
		console.log(`la nueva contraseña es esta ${newPassword}`);
		const {
			name,
			email,
			phone,
			street,
			apartment,
			zip,
			city,
			country,
			isAdmin,
		} = req.body;
		let userToUpdate = await User.findByIdAndUpdate(
			req.params.id,
			{
				name,
				email,
				passwordHash: newPassword,
				phone,
				street,
				apartment,
				zip,
				city,
				country,
				isAdmin,
			},
			{
				new: true,
			}
		);

		if (!userToUpdate)
			return res.status(500).send("the user could not be updated.");

		res.send(userToUpdate);
	} catch (error) {
		return res.status(400).json({ succes: false, error: error.message });
	}
});

//delete user
router.delete("/:id", (req, res) => {
	//validate id
	if (!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send("Invalid id of product");

	User.findByIdAndRemove(req.params.id)
		.then((product) => {
			if (product) {
				return res.status(200).json({
					succes: true,
					message: `User with the id: ${req.params.id} deleted.`,
				});
			} else {
				return res
					.status(404)
					.json({ succes: false, message: `User not found.` });
			}
		})
		.catch((err) => {
			return res.status(400).json({ succes: false, error: err });
		});
});

module.exports = router;
