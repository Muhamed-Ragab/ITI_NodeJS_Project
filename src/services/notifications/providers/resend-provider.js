import { Resend } from "resend";
import { env } from "../../../config/env.js";
import { EmailProviderStrategy } from "./email-provider-strategy.js";

/**
 * Resend email provider implementation
 * Uses Resend API for email delivery
 */
export class ResendProvider extends EmailProviderStrategy {
	constructor() {
		super();
		this.resend = null;
		this.initializeResend();
	}

	/**
	 * Initialize Resend client if configured
	 * @private
	 */
	initializeResend() {
		if (!this.isConfigured()) {
			return;
		}
		this.resend = new Resend(env.RESEND_API_KEY);
	}

	/**
	 * Check if Resend is properly configured
	 * @returns {boolean}
	 */
	isConfigured() {
		return Boolean(env.RESEND_API_KEY && env.MAIL_FROM);
	}

	/**
	 * Validate Resend configuration
	 * @throws {Error} If configuration is incomplete
	 */
	validateConfiguration() {
		const missing = [];
		if (!env.RESEND_API_KEY) {
			missing.push("RESEND_API_KEY");
		}
		if (!env.MAIL_FROM) {
			missing.push("MAIL_FROM");
		}

		if (missing.length > 0) {
			throw new Error(
				`Resend configuration incomplete. Missing: ${missing.join(", ")}`
			);
		}
	}

	/**
	 * Send email via Resend API
	 * @param {string} to - Recipient email
	 * @param {string} subject - Email subject
	 * @param {string} text - Plain text content
	 * @param {string} html - HTML content
	 * @returns {Promise<{sent: boolean, messageId: string, provider: string}>}
	 */
	async sendEmail(to, subject, text, html) {
		if (!this.resend) {
			throw new Error("Resend is not configured");
		}

		// Create timeout promise (10 seconds)
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error("Email send timeout")), 10_000);
		});

		// Send email via Resend
		const sendPromise = this.resend.emails.send({
			from: env.MAIL_FROM,
			to,
			subject,
			text,
			html,
		});

		try {
			const result = await Promise.race([sendPromise, timeoutPromise]);

			return {
				sent: true,
				messageId: result.data?.id || result.id,
				provider: "resend",
			};
		} catch (error) {
			console.error("Resend email send failed:", error);
			throw new Error(`Resend: ${error.message}`);
		}
	}

	/**
	 * Get Resend provider capabilities
	 * @returns {{batchSending: boolean, templates: boolean, attachments: boolean}}
	 */
	getProviderCapabilities() {
		return {
			batchSending: true,
			templates: false,
			attachments: true,
		};
	}
}
