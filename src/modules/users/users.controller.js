import * as service from "./users.service.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/errors/api-error.js";

export const getProfile = async (req, res, next) => {
	try {
		const user = await service.getUserById(req.user.id);
		if (!user) {
			throw ApiError.notFound({ message: "User not found" });
		}
		sendSuccess(res, { data: user });
	} catch (err) {
		if (!(err instanceof ApiError)) {
			next(ApiError.internal({ details: err.message }));
		} else {
			next(err);
		}
	}
};

export const updateProfile = async (req, res, next) => {
	try {
		const updated = await service.updateUserProfile(req.user.id, req.body);
		if (!updated) {
			throw ApiError.notFound({ message: "User not found or update failed" });
		}
		sendSuccess(res, {
			data: updated,
			message: "Profile updated successfully",
		});
	} catch (err) {
		if (!(err instanceof ApiError)) {
			next(ApiError.internal({ details: err.message }));
		} else {
			next(err);
		}
	}
};
