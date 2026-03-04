import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
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

export const listAll = async (filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);

	const [orders, total] = await Promise.all([
		Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Order.countDocuments(),
	]);

	return {
		orders,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};
