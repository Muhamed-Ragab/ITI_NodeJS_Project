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
