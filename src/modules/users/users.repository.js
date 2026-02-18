import User from "./user.model.js";

export const findById = async (id) => {
	return await User.findById(id);
};

export const findByEmail = async (email) => {
	return await User.findOne({ email });
};

export const list = async () => {
	return await User.find().sort({ createdAt: -1 });
};

export const updateById = async (id, data) => {
	return await User.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	});
};

export const addWishlist = async (userId, productId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $addToSet: { wishlist: productId } },
		{ new: true }
	);
};

export const removeWishlist = async (userId, productId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $pull: { wishlist: productId } },
		{ new: true }
	);
};

export const findCartItem = async (userId, productId) => {
	return await User.findOne({
		_id: userId,
		"cart.product": productId,
	});
};

export const updateCartItem = async (userId, productId, quantity) => {
	return await User.findOneAndUpdate(
		{ _id: userId, "cart.product": productId },
		{ $set: { "cart.$.quantity": quantity } },
		{ new: true }
	);
};

export const addCartItem = async (userId, productId, quantity) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $push: { cart: { product: productId, quantity } } },
		{ new: true }
	);
};

export const removeCartItem = async (userId, productId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $pull: { cart: { product: productId } } },
		{ new: true }
	);
};

export const addAddress = async (userId, address) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $push: { addresses: address } },
		{ new: true, runValidators: true }
	);
};

export const updateAddress = async (userId, addressId, address) => {
	return await User.findOneAndUpdate(
		{ _id: userId, "addresses._id": addressId },
		{
			$set: {
				"addresses.$.street": address.street,
				"addresses.$.city": address.city,
				"addresses.$.country": address.country,
				"addresses.$.zip": address.zip,
			},
		},
		{ new: true, runValidators: true }
	);
};

export const removeAddress = async (userId, addressId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $pull: { addresses: { _id: addressId } } },
		{ new: true }
	);
};

export const updateRole = async (userId, role) => {
	return await User.findByIdAndUpdate(userId, { role }, { new: true });
};
