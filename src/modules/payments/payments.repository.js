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
