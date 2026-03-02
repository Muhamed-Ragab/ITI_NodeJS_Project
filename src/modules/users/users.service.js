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

export const setUserRestriction = async (id, isRestricted) => {
	const updated = await repo.setRestriction(id, isRestricted);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated;
};

export const softDeleteUser = async (id) => {
	const deleted = await repo.softDeleteById(id);
	if (!deleted) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return deleted;
};

export const listSavedPaymentMethods = async (id) => {
	const user = await repo.listSavedPaymentMethods(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return user.saved_payment_methods || [];
};

export const addSavedPaymentMethod = async (id, methodData) => {
	const updated = await repo.addSavedPaymentMethod(id, methodData);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated.saved_payment_methods || [];
};

export const removeSavedPaymentMethod = async (id, methodId) => {
	const updated = await repo.removeSavedPaymentMethod(id, methodId);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated.saved_payment_methods || [];
};

export const setDefaultSavedPaymentMethod = async (id, methodId) => {
	const updated = await repo.setDefaultSavedPaymentMethod(id, methodId);
	if (!updated) {
		throw ApiError.notFound({
			code: "PAYMENT_METHOD.NOT_FOUND",
			message: "Payment method not found",
		});
	}

	return updated.saved_payment_methods || [];
};

export const requestSellerOnboarding = async (id, profileData) => {
	const updated = await repo.requestSellerOnboarding(id, profileData);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated;
};

export const listPendingSellerRequests = async () => {
	return await repo.listPendingSellerRequests();
};

export const reviewSellerOnboarding = async (id, status, note) => {
	const updated = await repo.reviewSellerOnboarding(id, status, note);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated;
};

export const createSellerPayoutRequest = async (id, payload) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	if (user.role !== "seller") {
		throw ApiError.forbidden({
			code: "SELLER.ROLE_REQUIRED",
			message: "Only sellers can request payouts",
		});
	}

	const requestedAmount = Number(payload.amount);
	if (requestedAmount > Number(user.wallet_balance || 0)) {
		throw ApiError.badRequest({
			code: "PAYOUT.INSUFFICIENT_BALANCE",
			message: "Insufficient seller balance",
			details: {
				wallet_balance: Number(user.wallet_balance || 0),
				requestedAmount,
			},
		});
	}

	const nextRequests = [
		...(user.seller_profile?.payout_requests || []),
		{
			amount: requestedAmount,
			status: "pending",
			note: payload.note || "",
			requested_at: new Date(),
			reviewed_at: null,
		},
	];

	const updated = await repo.updateById(id, {
		$set: { "seller_profile.payout_requests": nextRequests },
	});

	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated.seller_profile?.payout_requests || [];
};

export const reviewSellerPayoutRequest = async (
	userId,
	payoutId,
	status,
	note
) => {
	const user = await repo.findById(userId);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	const requests = [...(user.seller_profile?.payout_requests || [])];
	const index = requests.findIndex(
		(item) => String(item._id) === String(payoutId)
	);
	if (index === -1) {
		throw ApiError.notFound({
			code: "PAYOUT.NOT_FOUND",
			message: "Payout request not found",
		});
	}

	requests[index] = {
		...requests[index],
		status,
		note: note || requests[index].note || "",
		reviewed_at: new Date(),
	};

	let nextWalletBalance = Number(user.wallet_balance || 0);
	if (status === "paid") {
		nextWalletBalance = Math.max(
			0,
			nextWalletBalance - Number(requests[index].amount)
		);
	}

	const updated = await repo.updateById(userId, {
		$set: {
			wallet_balance: nextWalletBalance,
			"seller_profile.payout_requests": requests,
		},
	});

	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return {
		wallet_balance: updated.wallet_balance,
		payout_requests: updated.seller_profile?.payout_requests || [],
	};
};

export const updateMarketingPreferences = async (id, payload) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	const current = user.marketing_preferences || {};
	const nextPreferences = {
		push_notifications:
			payload.push_notifications ?? current.push_notifications ?? true,
		email_newsletter:
			payload.email_newsletter ?? current.email_newsletter ?? false,
		promotional_notifications:
			payload.promotional_notifications ??
			current.promotional_notifications ??
			true,
	};

	const updated = await repo.updateMarketingPreferences(id, nextPreferences);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return updated.marketing_preferences;
};

export const updatePreferredLanguage = async (id, language) => {
	const updated = await repo.updatePreferredLanguage(id, language);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return { language: updated.preferred_language };
};

export const applyReferralCode = async (id, referralCode) => {
	const result = await repo.applyReferralCode(id, referralCode);

	if (result?.error === "REFERRAL_NOT_FOUND") {
		throw ApiError.notFound({
			code: "REFERRAL.NOT_FOUND",
			message: "Referral code not found",
		});
	}

	if (result?.error === "REFERRAL_SELF") {
		throw ApiError.badRequest({
			code: "REFERRAL.SELF_NOT_ALLOWED",
			message: "You cannot apply your own referral code",
		});
	}

	if (result?.error === "USER_NOT_FOUND") {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	if (result?.error === "REFERRAL_ALREADY_APPLIED") {
		throw ApiError.badRequest({
			code: "REFERRAL.ALREADY_APPLIED",
			message: "Referral code already applied",
		});
	}

	return {
		reward_points: result.rewardPoints,
		referred_by: result.referrerId,
		loyalty_points: result.updatedUser?.loyalty_points,
	};
};

export const getLoyaltySummary = async (id) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return {
		loyalty_points: Number(user.loyalty_points || 0),
		referrals_count: Number(user.referrals_count || 0),
	};
};

export const getReferralSummary = async (id) => {
	const user = await repo.findById(id);
	if (!user) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	let referralCode = user.referral_code;
	if (!referralCode) {
		referralCode = `REF-${String(user._id).slice(-6).toUpperCase()}`;
		await repo.updateById(id, { referral_code: referralCode });
	}

	return {
		referral_code: referralCode,
		referrals_count: Number(user.referrals_count || 0),
		referred_by: user.referred_by || null,
	};
};

export const grantLoyaltyPoints = async (id, points, _reason) => {
	const updated = await repo.grantLoyaltyPoints(id, points);
	if (!updated) {
		throw ApiError.notFound({
			code: "USER.NOT_FOUND",
			message: "User not found",
		});
	}

	return {
		loyalty_points: Number(updated.loyalty_points || 0),
		granted_points: points,
	};
};

export const broadcastMarketingMessage = async ({ channel, title, body }) => {
	const users = await repo.listUsersForMarketing(channel);

	return {
		channel,
		title,
		body,
		recipients_count: users.length,
	};
};
