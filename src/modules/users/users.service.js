import { ApiError } from "../../utils/errors/api-error.js";
import * as repo from "./users.repository.js";

export const getUserById = async (id) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return user;
};

export const updateUserProfile = async (id, data) => {
	const updated = await repo.updateById(id, data);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.UPDATE_FAILED",
			message: "User not found or update failed",
		});
	}
	return updated;
};

export const getUserWishlist = async (id) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return user.wishlist || [];
};

export const addProductToWishlist = async (id, productId) => {
	const result = await repo.addWishlist(id, productId);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.wishlist;
};

export const removeProductFromWishlist = async (id, productId) => {
	const result = await repo.removeWishlist(id, productId);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.wishlist;
};

export const getUserCart = async (id) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return user.cart || [];
};

export const upsertCartItem = async (userId, productId, quantity) => {
	const itemExists = await repo.findCartItem(userId, productId);

	const result = itemExists
		? await repo.updateCartItem(userId, productId, quantity)
		: await repo.addCartItem(userId, productId, quantity);

	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.cart;
};

export const removeCartItem = async (userId, productId) => {
	const result = await repo.removeCartItem(userId, productId);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.cart;
};

export const addAddress = async (id, address) => {
	const result = await repo.addAddress(id, address);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.addresses;
};

export const updateAddress = async (id, addressId, address) => {
	const result = await repo.updateAddress(id, addressId, address);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.ADDRESS_NOT_FOUND",
			message: "User or address not found",
		});
	}
	return result.addresses;
};

export const removeAddress = async (id, addressId) => {
	const result = await repo.removeAddress(id, addressId);
	if (!result) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}
	return result.addresses;
};

export const listUsers = async () => {
	return await repo.list();
};

export const updateRole = async (id, role) => {
	const updated = await repo.updateRole(id, role);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found or role update failed",
		});
	}
	return updated;
};
