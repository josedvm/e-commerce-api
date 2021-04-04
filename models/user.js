const mongoose = require("mongoose");

/* scheme */
const userScheme = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	street: {
		type: String,
		default: "",
	},
	apartment: {
		type: String,
		default: "",
	},
	zip: {
		type: String,
		default: "",
	},
	city: {
		type: String,
		default: "",
	},
	country: {
		type: String,
		default: "",
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
});

/* add virtual id to facilitate the woek in frontend */
userScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
userScheme.set("toJSON", { virtuals: true });

/* model */
exports.User = mongoose.model("User", userScheme);
