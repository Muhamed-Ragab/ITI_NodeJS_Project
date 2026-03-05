import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/errors/api-error.js";
import { CdnProvider } from "./cdn-provider.js";

const CLOUDINARY_RESOURCE_TYPE = "image";
const CLOUDINARY_PROTOCOL = "cloudinary:";

const parseCloudinaryUrl = () => {
	if (!env.CLOUDINARY_URL) {
		throw ApiError.internal({
			code: "CLOUDINARY_NOT_CONFIGURED",
			message: "Cloudinary URL is not configured",
		});
	}

	let parsed;
	try {
		parsed = new URL(env.CLOUDINARY_URL);
	} catch {
		throw ApiError.internal({
			code: "CLOUDINARY_CONFIG_INVALID",
			message: "Cloudinary URL is invalid",
		});
	}

	if (parsed.protocol !== CLOUDINARY_PROTOCOL) {
		throw ApiError.internal({
			code: "CLOUDINARY_CONFIG_INVALID",
			message: "Cloudinary URL must use cloudinary:// protocol",
		});
	}

	const cloudName = parsed.hostname;
	const apiKey = parsed.username;
	const apiSecret = parsed.password;

	if (!(cloudName && apiKey && apiSecret)) {
		throw ApiError.internal({
			code: "CLOUDINARY_CONFIG_INVALID",
			message: "Cloudinary URL must include cloud name, api key and api secret",
		});
	}

	return { cloudName, apiKey, apiSecret };
};

const buildUploadUrl = (cloudName) =>
	`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export class CloudinaryProvider extends CdnProvider {
	constructor() {
		super();
		this.credentials = null;
	}

	getCredentials() {
		if (!this.credentials) {
			this.credentials = parseCloudinaryUrl();
			cloudinary.config({
				cloud_name: this.credentials.cloudName,
				api_key: this.credentials.apiKey,
				api_secret: this.credentials.apiSecret,
				secure: true,
			});
		}

		return this.credentials;
	}

	async upload(source, options = {}) {
		this.getCredentials();

		try {
			const result = await cloudinary.uploader.upload(source, {
				resource_type: CLOUDINARY_RESOURCE_TYPE,
				...options,
			});

			return result.secure_url;
		} catch {
			throw ApiError.internal({
				code: "CDN_UPLOAD_FAILED",
				message: "Failed to upload image to CDN",
			});
		}
	}

	getUploadRequestPayload(options = {}) {
		const credentials = this.getCredentials();
		const timestamp = Math.floor(Date.now() / 1000);
		const folder = options.folder ?? "products";
		const paramsToSign = { folder, timestamp };
		const signature = cloudinary.utils.api_sign_request(
			paramsToSign,
			credentials.apiSecret
		);

		return {
			uploadUrl: buildUploadUrl(credentials.cloudName),
			cloudName: credentials.cloudName,
			apiKey: credentials.apiKey,
			folder,
			timestamp,
			signature,
		};
	}
}
