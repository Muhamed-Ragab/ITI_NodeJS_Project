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

export const findBySeller = async (sellerId) => {
	return await Order.find({ "items.seller_id": sellerId }).sort({
		createdAt: -1,
	});
};

export const updateStatusById = async (orderId, status, source = "admin") => {
	return await Order.findByIdAndUpdate(
		orderId,
		{
			status,
			$push: {
				status_timeline: {
					status,
					changed_at: new Date(),
					source,
					note: "Order status updated",
				},
			},
		},
		{ new: true, runValidators: true }
	);
};

export const appendStatusTimelineEvent = async (orderId, event) => {
	return await Order.findByIdAndUpdate(
		orderId,
		{
			$push: {
				status_timeline: {
					status: event.status,
					changed_at: event.changed_at ?? new Date(),
					source: event.source ?? "system",
					note: event.note ?? "",
				},
			},
		},
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
