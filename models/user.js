const mongoose = require("mongoose");

/* scheme */
const userScheme = mongoose.Schema({
	name: String,
	image: String,
	countInStock: {
		type: Number,
		required: true,
	},
});

/* add virtual id to facilitate the woek in frontend */
userScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
userScheme.set("toJSON", { virtuals: true });

/* model */
exports.User = mongoose.model("User", userScheme);
