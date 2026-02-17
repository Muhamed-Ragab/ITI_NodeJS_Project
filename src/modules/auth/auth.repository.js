import User from "../users/user.model.js";

export const findUserByEmail = (email) => User.findOne({ email });
export const findUserByGoogleId = (googleId) => User.findOne({ googleId });
export const createUser = (data) => User.create(data);
