const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItem");

//get todas los ordenes
router.get(`/`, async (req, res) => {
	const orderList = await Order.find().populate("user", "name");
	//.sort({ dateOrdered: -1 }); de mas nuevo a viejo
	//.sort("dateOrdered"); de mas viejo a nuevo
	if (!orderList) {
		res.status(500).json({ error: "something was wrong!" });
	}
	res.send(orderList);
});

//get una orden by id
router.get(`/:id`, async (req, res) => {
	const order = await Order.findById(req.params.id).populate("user", "name");
	//.sort({ dateOrdered: -1 }); de mas nuevo a viejo
	//.sort("dateOrdered"); de mas viejo a nuevo
	if (!order) {
		res.status(500).json({ error: "something was wrong!" });
	}
	res.send(order);
});

//post - crear una nueva orden de compra
router.post("/", async (req, res) => {
	const {
		orderItems,
		shippingAddress1,
		shippingAddress2,
		zip,
		city,
		country,
		phone,
		status,
		totalPrice,
		user,
	} = req.body;
	// crear primero los orderItems para retornar sus ids y agregarlos a la nueva orden
	let orderItemsIdsPromise = Promise.all(
		orderItems.map(async (orderItem) => {
			let newOrderItem = new OrderItem({
				quantity: orderItem.quantity,
				product: orderItem.product,
			});
			newOrderItem = await newOrderItem.save();

			return newOrderItem.id;
		})
	);

	let orderItemsIds = await orderItemsIdsPromise;
	console.log(orderItemsIds);

	let newOrder = new Order({
		orderItems: orderItemsIds,
		shippingAddress1,
		shippingAddress2,
		zip,
		city,
		country,
		phone,
		status,
		totalPrice,
		user,
	});

	newOrder = await newOrder.save();

	if (!newOrder) return res.status(500).send("the order could not be created.");

	res.send(newOrder);
});

module.exports = router;
