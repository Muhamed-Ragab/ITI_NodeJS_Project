import User from "../users/user.model.js";

export const findUserByEmail = async (email) => {
	return await User.findOne({ email }).select("+password");
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
