import {
	buildPaginationMeta,
	parsePagination,
} from "../../utils/pagination.js";
import Order from "../orders/orders.model.js";
import * as ordersRepo from "../orders/orders.repository.js";

/**
 * Find order by ID. Reuses orders repository.
 */
export const findOrderById = async (orderId) => {
	return await ordersRepo.findById(orderId);
};

/**
 * Update order payment info and optionally status.
 */
export const updateOrderPaymentStatus = async (orderId, paymentData) => {
	const updateData = {};
	if (paymentData.payment_info) {
		updateData.payment_info = paymentData.payment_info;
	}
	if (paymentData.status) {
		updateData.status = paymentData.status;
	}
	return await Order.findByIdAndUpdate(orderId, updateData, {
		new: true,
		runValidators: true,
	});
};

export const listPaymentsForAdmin = async (filters = {}) => {
	const { page, limit, skip } = parsePagination(filters);
	const query = {};

	if (filters.status) {
		query["payment_info.status"] = filters.status;
	}

	const [payments, total] = await Promise.all([
		Order.find(query)
			.select("_id user status total_amount payment_info createdAt")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Order.countDocuments(query),
	]);

	return {
		payments,
		pagination: buildPaginationMeta({ page, limit, total }),
	};
};
