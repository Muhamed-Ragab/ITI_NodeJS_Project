import * as repo from "./users.repository.js";

export const getUserById = (id) => repo.findById(id);
export const updateUserProfile = (id, data) => repo.updateById(id, data);

export const getUserWishlist = (id) =>
	repo.findById(id).then((u) => u.wishlist);
export const addProductToWishlist = (id, product) =>
	repo.addWishlist(id, product);
export const removeProductFromWishlist = (id, product) =>
	repo.removeWishlist(id, product);

export const getUserCart = (id) => repo.findById(id).then((u) => u.cart);
export const upsertCartItem = (id, product, qty) =>
	repo.updateCartItem(id, product, qty);
export const removeCartItem = (id, product) => repo.removeCartItem(id, product);

export const updateRole = (id, role) => repo.updateRole(id, role);
