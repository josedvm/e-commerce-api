const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

//post - create a suer
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

//login
router.post("/login", async (req, res) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return res.status(400).send("user not found");
	console.log({ user });
	//validar contaseña con bcrypt
	if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
		// se crrea el token para enviar al usuario
		const token = jwt.sign(
			{
				userId: user.id,
			},
			"secret" //se usa para crear el token
			/* , {expireIn : "1id"} ejemplo de tiempo de expiracion del token */
		);
		res.status(200).send({ user: user.email, token });
	} else {
		res.status(400).send("wrong password");
	}
});

module.exports = router;
