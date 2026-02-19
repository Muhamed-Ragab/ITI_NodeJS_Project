import { ApiError } from "../../utils/errors/api-error.js";
import { CloudinaryProvider } from "./cloudinary-provider.js";

const providers = {
	cloudinary: () => new CloudinaryProvider(),
};

export const createCdnProvider = (name = "cloudinary") => {
	if (!Object.hasOwn(providers, name)) {
		throw ApiError.internal({
			code: "UNSUPPORTED_CDN_PROVIDER",
			message: `CDN provider '${name}' is not supported`,
		});
	}

	return providers[name]();
};
