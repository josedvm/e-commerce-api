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
	const order = await Order.findById(req.params.id)
		.populate("user", "name")
		.populate({
			path: "orderItems",
			populate: {
				path: "product",
				populate: { path: "category", select: "name color " },
				select: "name image",
			},
			select: "-quantity -__v ",
		}); //traer la informacion de la tabla orderItems
	//.populate({ path: "orderItems", populate: "product" }); dentro de orderItema traer la info del campo product

	/* .populate({ anidado
			path: "orderItems",
			populate: {
				path: "product",
				populate: { path: "category", select: "_id image" },
				select: "category",
			},
		}); */

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

//put -update Order - cambiar solo el estado de la orden
router.put("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const orderToUpdate = await Order.findByIdAndUpdate(
			id,
			{
				status: req.body.status,
			},
			{
				new: true, //mostrar la nueva info
			}
		);

		if (!orderToUpdate)
			return res.status(500).send("the order could not be update.");

		res.send(orderToUpdate);
	} catch (error) {
		console.error(error);
	}
});

//delete una orden
router.delete("/:id", (req, res) => {
	Order.findByIdAndRemove(req.params.id)
		.then(async (order) => {
			if (order) {
				//borrar tambien los orderItems dentro de Order
				await order.orderItems.map(async (orderItem) => {
					await OrderItem.findByIdAndRemove(orderItem);
				});
				return res.status(200).json({
					succes: true,
					message: `Order with the id: ${req.params.id} deleted.`,
				});
			} else {
				return res
					.status(404)
					.json({ succes: false, message: `Order not found.` });
			}
		})
		.catch((err) => {
			return res.status(400).json({ succes: false, error: err });
		});
});

module.exports = router;
