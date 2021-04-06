const mongoose = require("mongoose");

/* scheme */
const orderItemScheme = mongoose.Schema({
	quantity: {
		type: Number,
		require: true,
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
});

/* add virtual id to facilitate the woek in frontend */
orderItemScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
orderItemScheme.set("toJSON", { virtuals: true });

/* model */
exports.orderItem = mongoose.model("OrderItem", orderItemScheme);
