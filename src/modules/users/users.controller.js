import * as service from "./users.service.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/errors/api-error.js";

// ===== Profile =====
export const getProfile = async (req, res, next) => {
  try {
    const user = await service.getUserById(req.user.id);
    sendSuccess(res, { data: user });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal({ details: err.message }));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await service.updateUserProfile(req.user.id, req.body);
    sendSuccess(res, { data: updated, message: "Profile updated successfully" });
  } catch (err) {
    next(err instanceof ApiError ? err : ApiError.internal({ details: err.message }));
  }
};

// ===== Wishlist =====
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await service.getUserWishlist(req.user.id);
    sendSuccess(res, { data: wishlist });
  } catch (err) {
    next(err);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const updated = await service.addProductToWishlist(req.user.id, req.body.productId);
    sendSuccess(res, { data: updated, message: "Product added to wishlist" });
  } catch (err) {
    next(err);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const updated = await service.removeProductFromWishlist(req.user.id, req.params.productId);
    sendSuccess(res, { data: updated, message: "Product removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

// ===== Cart =====
export const getCart = async (req, res, next) => {
  try {
    const cart = await service.getUserCart(req.user.id);
    sendSuccess(res, { data: cart });
  } catch (err) {
    next(err);
  }
};

export const upsertCart = async (req, res, next) => {
  try {
    const { product, quantity } = req.body;
    const updated = await service.upsertCartItem(req.user.id, product, quantity);
    sendSuccess(res, { data: updated, message: "Cart updated" });
  } catch (err) {
    next(err);
  }
};

export const removeCartItemController = async (req, res, next) => {
  try {
    const updated = await service.removeCartItem(req.user.id, req.params.productId);
    sendSuccess(res, { data: updated, message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};
