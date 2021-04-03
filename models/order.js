const mongoose = require("mongoose");

/* scheme */
const orderScheme = mongoose.Schema({
	name: String,
	image: String,
	countInStock: {
		type: Number,
		required: true,
	},
});

/* add virtual id to facilitate the woek in frontend */
orderScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
orderScheme.set("toJSON", { virtuals: true });

/* model */
exports.Order = mongoose.model("Order", orderScheme);
