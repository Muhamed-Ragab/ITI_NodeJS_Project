import { env } from "../../../config/env.js";
import { logDevError } from "../../../utils/logger.js";
import { EmailJSProvider } from "./emailjs-provider.js";
import { ResendProvider } from "./resend-provider.js";

/**
 * Registry of available email providers
 * Maps provider names to their implementation classes
 */
const PROVIDERS = {
	resend: ResendProvider,
	emailjs: EmailJSProvider,
};

/**
 * Default email provider if EMAIL_PROVIDER is not set
 */
const DEFAULT_PROVIDER = "resend";

/**
 * Create and configure an email provider instance
 * @returns {EmailProviderStrategy} Configured email provider
 * @throws {Error} If provider name is invalid or configuration fails in production
 */
export const createEmailProvider = () => {
	const providerName = (env.EMAIL_PROVIDER || DEFAULT_PROVIDER).toLowerCase();

	// Validate provider name
	if (!PROVIDERS[providerName]) {
		const validProviders = Object.keys(PROVIDERS).join(", ");
		throw new Error(
			`Invalid EMAIL_PROVIDER: "${providerName}". Valid options: ${validProviders}`
		);
	}

	// Create provider instance
	const ProviderClass = PROVIDERS[providerName];
	const provider = new ProviderClass();

	// Validate configuration
	try {
		provider.validateConfiguration();
	} catch (error) {
		logDevError({
			scope: "notifications.provider-factory",
			message: `Email provider "${providerName}" configuration error`,
			meta: { error: error.message },
		});

		// In production, throw error; in development/test, warn and continue
		if (env.NODE_ENV === "production") {
			throw error;
		}
	}

	return provider;
};

/**
 * Get list of available email provider names
 * @returns {string[]} Array of provider names
 */
export const getAvailableProviders = () => {
	return Object.keys(PROVIDERS);
};

/**
 * Check if a specific provider is configured
 * @param {string} providerName - Name of the provider to check
 * @returns {boolean} True if provider is configured
 */
export const isProviderConfigured = (providerName) => {
	if (!PROVIDERS[providerName]) {
		return false;
	}

	const ProviderClass = PROVIDERS[providerName];
	const provider = new ProviderClass();
	return provider.isConfigured();
};
