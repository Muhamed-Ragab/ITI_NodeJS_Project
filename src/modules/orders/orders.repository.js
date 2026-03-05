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

export const findByUser = async (userId, filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = { user: userId };

	// Apply status filter if provided
	if (filters.status && filters.status.trim() !== '') {
		query.status = filters.status.trim();
	}

	const [orders, total] = await Promise.all([
		Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Order.countDocuments(query),
	]);
	return {
		orders,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};

export const findBySeller = async (sellerId, filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = { "items.seller_id": sellerId };

	// Apply status filter if provided
	if (filters.status && filters.status.trim() !== '') {
		query.status = filters.status.trim();
	}

	const [orders, total] = await Promise.all([
		Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Order.countDocuments(query),
	]);
	return {
		orders,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
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
	const query = {};

	// Apply status filter if provided
	if (filters.status && filters.status.trim() !== '') {
		query.status = filters.status.trim();
	}

	const [orders, total] = await Promise.all([
		Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Order.countDocuments(query),
	]);

	return {
		orders,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};
