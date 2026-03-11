/**
 * Abstract base class for email provider implementations.
 * All email providers must extend this class and implement its abstract methods.
 *
 * @abstract
 */
export class EmailProviderStrategy {
	constructor() {
		if (new.target === EmailProviderStrategy) {
			throw new Error(
				"EmailProviderStrategy is abstract and cannot be instantiated directly"
			);
		}
	}

	/**
	 * Send a generic email
	 * @param {string} to - Recipient email address
	 * @param {string} subject - Email subject
	 * @param {string} text - Plain text content
	 * @param {string} html - HTML content
	 * @returns {Promise<{sent: boolean, messageId: string, provider: string}>}
	 * @abstract
	 */
	sendEmail(_to, _subject, _text, _html) {
		throw new Error("sendEmail() must be implemented by concrete provider");
	}

	/**
	 * Check if the provider is properly configured
	 * @returns {boolean}
	 * @abstract
	 */
	isConfigured() {
		throw new Error("isConfigured() must be implemented by concrete provider");
	}

	/**
	 * Validate provider configuration and throw descriptive errors if invalid
	 * @throws {Error} If configuration is invalid
	 * @abstract
	 */
	validateConfiguration() {
		throw new Error(
			"validateConfiguration() must be implemented by concrete provider"
		);
	}

	/**
	 * Get provider-specific capabilities
	 * @returns {{batchSending: boolean, templates: boolean, attachments: boolean}}
	 */
	getProviderCapabilities() {
		return {
			batchSending: false,
			templates: false,
			attachments: false,
		};
	}
}
