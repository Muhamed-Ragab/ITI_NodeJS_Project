import User from "../users/user.model.js";

export const findUserByEmail = async (email) => {
	return await User.findOne({ email }).select("+password");
};

export const findUserByEmailWithOtp = async (email) => {
	return await User.findOne({ email }).select(
		"+emailOtpHash +emailOtpExpiresAt"
	);
};

export const findUserByGoogleId = async (googleId) => {
	return await User.findOne({ googleId });
};

export const attachGoogleIdToUser = async (userId, googleId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ googleId },
		{ new: true, runValidators: true }
	);
};

export const createUser = async (data) => {
	return await User.create(data);
};

export const findUserById = async (id) => {
	return await User.findById(id);
};

export const incrementTokenVersion = async (userId) => {
	return await User.findByIdAndUpdate(
		userId,
		{ $inc: { tokenVersion: 1 } },
		{ new: true }
	);
};

export const setEmailOtp = async (userId, otpHash, otpExpiresAt) => {
	return await User.findByIdAndUpdate(
		userId,
		{ emailOtpHash: otpHash, emailOtpExpiresAt: otpExpiresAt },
		{ new: true }
	);
};

export const consumeEmailOtp = async (userId) => {
	return await User.findByIdAndUpdate(
		userId,
		{
			emailOtpHash: null,
			emailOtpExpiresAt: null,
		},
		{ new: true }
	);
};

export const findUserByEmailVerificationTokenHash = async (tokenHash) => {
	return await User.findOne({
		emailVerificationTokenHash: tokenHash,
	}).select("+emailVerificationTokenHash +emailVerificationTokenExpiresAt");
};

export const verifyUserEmail = async (userId) => {
	return await User.findByIdAndUpdate(
		userId,
		{
			isEmailVerified: true,
			emailVerificationTokenHash: null,
			emailVerificationTokenExpiresAt: null,
		},
		{ new: true }
	);
};
