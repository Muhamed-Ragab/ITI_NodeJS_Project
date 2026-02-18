import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/errors/api-error.js";
import { sendSuccess } from "../../utils/response.js";
import * as service from "./users.service.js";

export const getProfile = async (req, res, next) => {
	try {
		const user = await service.getUserById(req.user.id);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: user,
			message: "Profile retrieved successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "USER.RETRIEVE_FAILED",
						message: "Failed to retrieve profile",
						details: { message: error.message },
					})
		);
	}
};

export const updateProfile = async (req, res, next) => {
	try {
		const updated = await service.updateUserProfile(req.user.id, req.body);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Profile updated successfully",
		});
	} catch (error) {
		next(
			error instanceof ApiError
				? error
				: ApiError.internal({
						code: "USER.UPDATE_FAILED",
						message: "Failed to update profile",
						details: { message: error.message },
					})
		);
	}
};

export const getWishlist = async (req, res, next) => {
	try {
		const wishlist = await service.getUserWishlist(req.user.id);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: wishlist,
		});
	} catch (error) {
		next(error);
	}
};

export const addWishlistItem = async (req, res, next) => {
	try {
		const updated = await service.addProductToWishlist(
			req.user.id,
			req.body.productId
		);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Product added to wishlist",
		});
	} catch (error) {
		next(error);
	}
};

export const removeWishlistItem = async (req, res, next) => {
	try {
		const updated = await service.removeProductFromWishlist(
			req.user.id,
			req.params.productId
		);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Product removed from wishlist",
		});
	} catch (error) {
		next(error);
	}
};

export const getCart = async (req, res, next) => {
	try {
		const cart = await service.getUserCart(req.user.id);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: cart,
		});
	} catch (error) {
		next(error);
	}
};

export const upsertCart = async (req, res, next) => {
	try {
		const { product, quantity } = req.body;
		const updated = await service.upsertCartItem(
			req.user.id,
			product,
			quantity
		);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Cart updated",
		});
	} catch (error) {
		next(error);
	}
};

export const removeCartItemController = async (req, res, next) => {
	try {
		const updated = await service.removeCartItem(
			req.user.id,
			req.params.productId
		);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Item removed from cart",
		});
	} catch (error) {
		next(error);
	}
};

export const addAddress = async (req, res, next) => {
	try {
		const updated = await service.addAddress(req.user.id, req.body);
		return sendSuccess(res, {
			statusCode: StatusCodes.CREATED,
			data: updated,
			message: "Address added successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const updateAddress = async (req, res, next) => {
	try {
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
	} catch (error) {
		next(error);
	}
};

export const removeAddress = async (req, res, next) => {
	try {
		const updated = await service.removeAddress(
			req.user.id,
			req.params.addressId
		);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "Address removed successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const listUsers = async (_req, res, next) => {
	try {
		const users = await service.listUsers();
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: users,
		});
	} catch (error) {
		next(error);
	}
};

export const updateRole = async (req, res, next) => {
	try {
		const updated = await service.updateRole(req.params.id, req.body.role);
		return sendSuccess(res, {
			statusCode: StatusCodes.OK,
			data: updated,
			message: "User role updated successfully",
		});
	} catch (error) {
		next(error);
	}
};
