const mongoose = require("mongoose");

/* scheme */
const orderScheme = mongoose.Schema({
	orderItems: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "OrderItem",
			required: true,
		},
	],
	shippingAddress1: {
		type: String,
		required: true,
	},
	shippingAddress2: {
		type: String,
		default: "",
	},
	zip: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
		default: "Pending",
	},
	totalPrice: {
		type: Number,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	dateOrdered: {
		type: Date,
		default: Date.now,
	},
});

/* add virtual id to facilitate the woek in frontend */
orderScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
orderScheme.set("toJSON", { virtuals: true });

/* model */
exports.Order = mongoose.model("Order", orderScheme);
