import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./users.service.js";

export const getProfile = async (req, res) => {
	const user = await service.getUserById(req.user.id);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: user,
		message: "Profile retrieved successfully",
	});
};

export const updateProfile = async (req, res) => {
	const updated = await service.updateUserProfile(req.user.id, req.body);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Profile updated successfully",
	});
};

export const getWishlist = async (req, res) => {
	const wishlist = await service.getUserWishlist(req.user.id);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: wishlist,
	});
};

export const addWishlistItem = async (req, res) => {
	const updated = await service.addProductToWishlist(
		req.user.id,
		req.body.productId
	);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Product added to wishlist",
	});
};

export const removeWishlistItem = async (req, res) => {
	const updated = await service.removeProductFromWishlist(
		req.user.id,
		req.params.productId
	);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Product removed from wishlist",
	});
};

export const getCart = async (req, res) => {
	const cart = await service.getUserCart(req.user.id);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: cart,
	});
};

export const upsertCart = async (req, res) => {
	const { product, quantity } = req.body;
	const updated = await service.upsertCartItem(req.user.id, product, quantity);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Cart updated",
	});
};

export const removeCartItemController = async (req, res) => {
	const updated = await service.removeCartItem(
		req.user.id,
		req.params.productId
	);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Item removed from cart",
	});
};

export const addAddress = async (req, res) => {
	const updated = await service.addAddress(req.user.id, req.body);
	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: updated,
		message: "Address added successfully",
	});
};

export const updateAddress = async (req, res) => {
	const updated = await service.updateAddress(
		req.user.id,
		req.params.addressId,
		req.body
	);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Address updated successfully",
	});
};

export const removeAddress = async (req, res) => {
	const updated = await service.removeAddress(
		req.user.id,
		req.params.addressId
	);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "Address removed successfully",
	});
};

export const listUsers = async (_req, res) => {
	const users = await service.listUsers();
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: users,
	});
};

export const updateRole = async (req, res) => {
	const updated = await service.updateRole(req.params.id, req.body.role);
	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "User role updated successfully",
	});
};

export const setUserRestriction = async (req, res) => {
	const updated = await service.setUserRestriction(
		req.params.id,
		req.body.isRestricted
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: updated,
		message: "User restriction updated successfully",
	});
};

export const softDeleteUser = async (req, res) => {
	const deleted = await service.softDeleteUser(req.params.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: deleted,
		message: "User soft deleted successfully",
	});
};

export const listSavedPaymentMethods = async (req, res) => {
	const methods = await service.listSavedPaymentMethods(req.user.id);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: methods,
		message: "Saved payment methods retrieved successfully",
	});
};

export const addSavedPaymentMethod = async (req, res) => {
	const methods = await service.addSavedPaymentMethod(req.user.id, req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: methods,
		message: "Saved payment method added successfully",
	});
};

export const removeSavedPaymentMethod = async (req, res) => {
	const methods = await service.removeSavedPaymentMethod(
		req.user.id,
		req.params.methodId
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: methods,
		message: "Saved payment method removed successfully",
	});
};

export const setDefaultSavedPaymentMethod = async (req, res) => {
	const methods = await service.setDefaultSavedPaymentMethod(
		req.user.id,
		req.params.methodId
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: methods,
		message: "Default payment method updated successfully",
	});
};

export const requestSellerOnboarding = async (req, res) => {
	const profile = await service.requestSellerOnboarding(req.user.id, req.body);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: profile,
		message: "Seller onboarding request submitted successfully",
	});
};

export const listPendingSellerRequests = async (_req, res) => {
	const requests = await service.listPendingSellerRequests();

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: requests,
		message: "Pending seller requests retrieved successfully",
	});
};

export const reviewSellerOnboarding = async (req, res) => {
	const reviewed = await service.reviewSellerOnboarding(
		req.params.id,
		req.body.status,
		req.body.note
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: reviewed,
		message: "Seller onboarding request reviewed successfully",
	});
};

export const createSellerPayoutRequest = async (req, res) => {
	const payouts = await service.createSellerPayoutRequest(
		req.user.id,
		req.body
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.CREATED,
		data: payouts,
		message: "Seller payout request submitted successfully",
	});
};

export const reviewSellerPayoutRequest = async (req, res) => {
	const result = await service.reviewSellerPayoutRequest(
		req.params.id,
		req.params.payoutId,
		req.body.status,
		req.body.note
	);

	return sendSuccess(res, {
		statusCode: StatusCodes.OK,
		data: result,
		message: "Seller payout request reviewed successfully",
	});
};
