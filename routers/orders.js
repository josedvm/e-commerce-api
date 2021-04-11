const e = require("cors");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send(order);
});

// contar el precio total de todas las ordenes
router.get("/get/totalsales", async (req, res) => {
	try {
		const totalSales = await Order.aggregate([
			{ $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
		]);
		if (!totalSales) {
			return res
				.status(400)
				.json({ error: "The total sales could not be generated" });
		}
		res.send({ totalSales: totalSales.pop().totalSales });
	} catch (error) {
		console.error(error);
	}
});

//count orders
router.get(`/get/count`, async (req, res) => {
	const orderCount = await Order.countDocuments((count) => count);
	if (!orderCount) {
		return res.status(500).json({ error: "something was wrong!" });
	}
	res.send({ count: orderCount });
});

//retornar las ordenes de compra de un usuario mediannte el id
router.get(`/get/userorders/:userid`, async (req, res) => {
	//validate id
	if (!mongoose.isValidObjectId(req.params.userid))
		return res.status(400).send("Invalid id of user");
	try {
		const userOrdersList = await Order.find({ user: req.params.userid })
			.populate({
				path: "orderItems",
				populate: {
					path: "product",
					populate: { path: "category", select: "_id image" },
					select: "category",
				},
			})
			.sort({ dateOrdered: -1 });

		if (!userOrdersList) {
			return res.status(500).json({ error: "something was wrong!" });
		}
		res.send(userOrdersList);
	} catch (error) {
		console.error(error);
	}
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
	//calcular el precio total mediante los ids de orderItems
	let totalPriceOrder = await Promise.all(
		orderItemsIds.map(async (idOrderItem) => {
			let orderItem = await OrderItem.findById(idOrderItem).populate(
				"product",
				"price"
			);
			let totalPriceOrderItem = orderItem.quantity * orderItem.product.price;
			return totalPriceOrderItem;
		})
	);
	console.log(totalPriceOrder);
	//sumar los precios totales de cada OrderItem para tener el total de Order
	totalPriceOrder = totalPriceOrder.reduce((a, b) => a + b, 0);

	let newOrder = new Order({
		orderItems: orderItemsIds,
		shippingAddress1,
		shippingAddress2,
		zip,
		city,
		country,
		phone,
		status,
		totalPrice: totalPriceOrder,
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
