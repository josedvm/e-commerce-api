const mongoose = require("mongoose");

/* scheme */
const categoryScheme = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	color: {
		type: String,
	},
	icon: {
		type: String,
	},
	image: {
		type: String,
		default: "",
	},
});

/* add virtual id to facilitate the woek in frontend */
categoryScheme.virtual("id").get(function () {
	return this._id.toHexString();
});
categoryScheme.set("toJSON", { virtuals: true });

/* model */
exports.Category = mongoose.model("Category", categoryScheme);
