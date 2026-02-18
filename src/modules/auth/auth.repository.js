import User from "../users/user.model.js";

export const findUserByEmail = async (email) => {
	return await User.findOne({ email }).select("+password");
};

export const findUserByGoogleId = async (googleId) => {
	return await User.findOne({ googleId });
};

export const createUser = async (data) => {
	return await User.create(data);
};
