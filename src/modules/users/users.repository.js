import User from "./user.model.js";

export const findById = (id) => User.findById(id);
export const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const addWishlist = (userId, productId) =>
  User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { new: true });

export const removeWishlist = (userId, productId) =>
  User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { new: true });

export const addCartItem = (userId, product, qty) =>
  User.findByIdAndUpdate(userId, { $push: { cart: { product, quantity: qty } } }, { new: true });

export const updateCartItem = (userId, product, qty) =>
  User.findOneAndUpdate({ _id: userId, "cart.product": product }, { $set: { "cart.$.quantity": qty } }, { new: true });

export const removeCartItem = (userId, product) =>
  User.findByIdAndUpdate(userId, { $pull: { cart: { product } } }, { new: true });

export const updateRole = (userId, role) =>
  User.findByIdAndUpdate(userId, { role }, { new: true });
