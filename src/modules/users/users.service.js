import * as repo from "./users.repository.js";
import { ApiError } from "../../utils/errors/api-error.js";
import bcrypt from "bcryptjs";

// ==== Users ====
export const getUserById = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw ApiError.notFound({ message: "User not found" });
  const { password, ...safeUser } = user.toObject ? user.toObject() : user;
  return safeUser;
};

export const updateUserProfile = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await repo.updateById(id, data);
  if (!updated) throw ApiError.notFound({ message: "User not found or update failed" });

  const { password, ...safeUpdated } = updated.toObject ? updated.toObject() : updated;
  return safeUpdated;
};

// ==== Wishlist ====
export const getUserWishlist = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw ApiError.notFound({ message: "User not found" });
  return user.wishlist || [];
};

export const addProductToWishlist = (id, product) => repo.addWishlist(id, product);
export const removeProductFromWishlist = (id, product) => repo.removeWishlist(id, product);

// ==== Cart ====
export const getUserCart = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw ApiError.notFound({ message: "User not found" });
  return user.cart || [];
};

export const upsertCartItem = (id, product, qty) => repo.updateCartItem(id, product, qty);
export const removeCartItem = (id, product) => repo.removeCartItem(id, product);

// ==== Role ====
export const updateRole = async (id, role) => {
  const updated = await repo.updateRole(id, role);
  if (!updated) throw ApiError.notFound({ message: "User not found or role update failed" });
  return updated;
};
