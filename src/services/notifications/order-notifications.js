import { sendMail } from "./mailer.js";

const ORDER_STATUS_MESSAGES = {
	pending: "Your order has been placed successfully.",
	paid: "Your payment has been confirmed.",
	shipped: "Your order has been shipped.",
	delivered: "Your order has been delivered.",
	cancelled: "Your order has been cancelled.",
};

export const sendOrderStatusNotification = async ({
	orderId,
	status,
	email,
	name,
}) => {
	if (!(orderId && status && email)) {
		return { sent: false, reason: "missing-required-fields" };
	}

	const subject = `Order ${orderId} update: ${status}`;
	const message =
		ORDER_STATUS_MESSAGES[status] ??
		`Your order status was updated to ${status}.`;

	const text = `Hi ${name || "there"},\n\n${message}`;
	const html = `<p>Hi ${name || "there"},</p><p>${message}</p>`;

	return await sendMail({
		to: email,
		subject,
		text,
		html,
	});
};
