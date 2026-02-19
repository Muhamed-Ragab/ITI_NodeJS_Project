import Order from "./orders.model.js";

export const create = async (orderData) => {
	return await Order.create(orderData);
};

export const findById = async (orderId) => {
	return await Order.findById(orderId);
};

export const findByUser = async (userId) => {
	return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const updateStatusById = async (orderId, status) => {
	return await Order.findByIdAndUpdate(
		orderId,
		{ status },
		{ new: true, runValidators: true }
	);
};

export const listAll = async (skip = 0, limit = 20) => {
	return await Order.find()
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();
};
