import User from "./user.model.js";

export const findById = async (id) => {
	return await User.findOne({ _id: id, deletedAt: null });
};

export const list = async () => {
	return await User.find({ deletedAt: null }).sort({ createdAt: -1 });
};

export const updateById = async (id, data) => {
	return await User.findOneAndUpdate({ _id: id, deletedAt: null }, data, {
		new: true,
		runValidators: true,
	});
};

export const addWishlist = async (userId, productId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $addToSet: { wishlist: productId } },
		{ new: true }
	);
};

export const removeWishlist = async (userId, productId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $pull: { wishlist: productId } },
		{ new: true }
	);
};

export const findCartItem = async (userId, productId) => {
	return await User.findOne({
		_id: userId,
		deletedAt: null,
		"cart.product": productId,
	});
};

export const updateCartItem = async (userId, productId, quantity) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null, "cart.product": productId },
		{ $set: { "cart.$.quantity": quantity } },
		{ new: true }
	);
};

export const addCartItem = async (userId, productId, quantity) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $push: { cart: { product: productId, quantity } } },
		{ new: true }
	);
};

export const removeCartItem = async (userId, productId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $pull: { cart: { product: productId } } },
		{ new: true }
	);
};

export const addAddress = async (userId, address) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $push: { addresses: address } },
		{ new: true, runValidators: true }
	);
};

export const updateAddress = async (userId, addressId, address) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null, "addresses._id": addressId },
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
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $pull: { addresses: { _id: addressId } } },
		{ new: true }
	);
};

export const updateRole = async (userId, role) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ role },
		{ new: true }
	);
};

export const setRestriction = async (userId, isRestricted) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ isRestricted },
		{ new: true }
	);
};

export const softDeleteById = async (userId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{
			deletedAt: new Date(),
			isRestricted: true,
			$inc: { tokenVersion: 1 },
		},
		{ new: true }
	);
};

export const listSavedPaymentMethods = async (userId) => {
	const user = await User.findOne({ _id: userId, deletedAt: null }).select(
		"saved_payment_methods"
	);
	return user;
};

export const addSavedPaymentMethod = async (userId, methodData) => {
	if (methodData.isDefault) {
		await User.updateOne(
			{ _id: userId, deletedAt: null },
			{ $set: { "saved_payment_methods.$[].isDefault": false } }
		);
	}

	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $push: { saved_payment_methods: methodData } },
		{ new: true }
	).select("saved_payment_methods");
};

export const removeSavedPaymentMethod = async (userId, methodId) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $pull: { saved_payment_methods: { _id: methodId } } },
		{ new: true }
	).select("saved_payment_methods");
};

export const setDefaultSavedPaymentMethod = async (userId, methodId) => {
	await User.updateOne(
		{ _id: userId, deletedAt: null },
		{ $set: { "saved_payment_methods.$[].isDefault": false } }
	);

	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null, "saved_payment_methods._id": methodId },
		{ $set: { "saved_payment_methods.$.isDefault": true } },
		{ new: true }
	).select("saved_payment_methods");
};

export const requestSellerOnboarding = async (userId, profileData) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{
			$set: {
				"seller_profile.store_name": profileData.store_name,
				"seller_profile.bio": profileData.bio,
				"seller_profile.payout_method": profileData.payout_method,
				"seller_profile.approval_status": "pending",
				"seller_profile.approval_note": "",
				"seller_profile.requested_at": new Date(),
				"seller_profile.reviewed_at": null,
			},
		},
		{ new: true, runValidators: true }
	);
};

export const listPendingSellerRequests = async () => {
	return await User.find({
		deletedAt: null,
		"seller_profile.approval_status": "pending",
	}).sort({ "seller_profile.requested_at": -1 });
};

export const reviewSellerOnboarding = async (userId, status, note = "") => {
	const nextRole = status === "approved" ? "seller" : "customer";

	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{
			$set: {
				role: nextRole,
				"seller_profile.approval_status": status,
				"seller_profile.approval_note": note,
				"seller_profile.reviewed_at": new Date(),
			},
		},
		{ new: true, runValidators: true }
	);
};

export const updateMarketingPreferences = async (userId, payload) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $set: { marketing_preferences: payload } },
		{ new: true, runValidators: true }
	).select("marketing_preferences");
};

export const updatePreferredLanguage = async (userId, language) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $set: { preferred_language: language } },
		{ new: true, runValidators: true }
	).select("preferred_language");
};

export const applyReferralCode = async (userId, referralCode) => {
	const referrer = await User.findOne({
		referral_code: referralCode,
		deletedAt: null,
	});
	if (!referrer) {
		return { error: "REFERRAL_NOT_FOUND" };
	}

	if (String(referrer._id) === String(userId)) {
		return { error: "REFERRAL_SELF" };
	}

	const user = await User.findOne({ _id: userId, deletedAt: null });
	if (!user) {
		return { error: "USER_NOT_FOUND" };
	}

	if (user.referred_by) {
		return { error: "REFERRAL_ALREADY_APPLIED" };
	}

	const rewardPoints = 25;

	const [updatedUser] = await Promise.all([
		User.findOneAndUpdate(
			{ _id: userId, deletedAt: null },
			{
				$set: { referred_by: referrer._id },
				$inc: { loyalty_points: rewardPoints },
			},
			{ new: true, runValidators: true }
		).select("referred_by loyalty_points"),
		User.findOneAndUpdate(
			{ _id: referrer._id, deletedAt: null },
			{ $inc: { referrals_count: 1, loyalty_points: rewardPoints } },
			{ new: true, runValidators: true }
		),
	]);

	return {
		updatedUser,
		referrerId: referrer._id,
		rewardPoints,
	};
};

export const grantLoyaltyPoints = async (userId, points) => {
	return await User.findOneAndUpdate(
		{ _id: userId, deletedAt: null },
		{ $inc: { loyalty_points: points } },
		{ new: true, runValidators: true }
	).select("loyalty_points");
};

export const listUsersForMarketing = async (channel) => {
	const query = { deletedAt: null };

	if (channel === "email") {
		query["marketing_preferences.email_newsletter"] = true;
	}

	if (channel === "push") {
		query["marketing_preferences.push_notifications"] = true;
	}

	if (channel === "promotional") {
		query["marketing_preferences.promotional_notifications"] = true;
	}

	return await User.find(query).select("email name marketing_preferences");
};
