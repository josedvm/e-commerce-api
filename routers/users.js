const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

//get
router.get(`/`, async (req, res) => {
	const userList = await User.find();
	if (!userList) {
		res.status(500).json({ error: "something was wrong!" });
	}
	res.send(userList);
});

//post - create a suer
router.post("/", async (req, res) => {
	const {
		name,
		email,
		passwordHash,
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
		passwordHash,
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

module.exports = router;
