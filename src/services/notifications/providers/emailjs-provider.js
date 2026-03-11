import emailjs from "@emailjs/nodejs";
import { env } from "../../../config/env.js";
import { EmailProviderStrategy } from "./email-provider-strategy.js";

/**
 * EmailJS provider implementation
 * Uses EmailJS API for template-based email delivery
 */
export class EmailJSProvider extends EmailProviderStrategy {
	constructor() {
		super();
		this.initialized = false;
		this.initializeEmailJS();
	}

	/**
	 * Initialize EmailJS with API keys
	 * @private
	 */
	initializeEmailJS() {
		if (!this.isConfigured()) {
			return;
		}

		try {
			emailjs.init({
				publicKey: env.EMAILJS_PUBLIC_KEY,
				privateKey: env.EMAILJS_PRIVATE_KEY,
			});
			this.initialized = true;
		} catch (error) {
			console.error("EmailJS initialization failed:", error);
			this.initialized = false;
		}
	}

	/**
	 * Check if EmailJS is properly configured
	 * @returns {boolean}
	 */
	isConfigured() {
		return Boolean(
			env.EMAILJS_SERVICE_ID &&
				env.EMAILJS_TEMPLATE_ID &&
				env.EMAILJS_PUBLIC_KEY &&
				env.EMAILJS_PRIVATE_KEY
		);
	}

	/**
	 * Validate EmailJS configuration
	 * @throws {Error} If configuration is incomplete
	 */
	validateConfiguration() {
		const missing = [];
		if (!env.EMAILJS_SERVICE_ID) {
			missing.push("EMAILJS_SERVICE_ID");
		}
		if (!env.EMAILJS_TEMPLATE_ID) {
			missing.push("EMAILJS_TEMPLATE_ID");
		}
		if (!env.EMAILJS_PUBLIC_KEY) {
			missing.push("EMAILJS_PUBLIC_KEY");
		}
		if (!env.EMAILJS_PRIVATE_KEY) {
			missing.push("EMAILJS_PRIVATE_KEY");
		}

		if (missing.length > 0) {
			throw new Error(
				`EmailJS configuration incomplete. Missing: ${missing.join(", ")}`
			);
		}
	}

	/**
	 * Send email via EmailJS API
	 * @param {string} to - Recipient email
	 * @param {string} subject - Email subject
	 * @param {string} text - Plain text content
	 * @param {string} html - HTML content
	 * @returns {Promise<{sent: boolean, messageId: string, provider: string}>}
	 */
	async sendEmail(to, subject, text, html) {
		if (!this.initialized) {
			throw new Error("EmailJS is not configured or initialized");
		}

		// Create timeout promise (10 seconds)
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error("Email send timeout")), 10_000);
		});

		// Map parameters to EmailJS template variables
		const templateParams = {
			to_email: to,
			subject,
			message: text,
			html_message: html,
			from_name: env.MAIL_FROM || "ITI E-Commerce",
		};

		// Send email via EmailJS
		const sendPromise = emailjs.send(
			env.EMAILJS_SERVICE_ID,
			env.EMAILJS_TEMPLATE_ID,
			templateParams
		);

		try {
			const result = await Promise.race([sendPromise, timeoutPromise]);

			return {
				sent: true,
				messageId: result.text || "emailjs-sent",
				provider: "emailjs",
			};
		} catch (error) {
			console.error("EmailJS email send failed:", error);
			throw new Error(`EmailJS: ${error.message || error.text || error}`);
		}
	}

	/**
	 * Get EmailJS provider capabilities
	 * @returns {{batchSending: boolean, templates: boolean, attachments: boolean}}
	 */
	getProviderCapabilities() {
		return {
			batchSending: false,
			templates: true,
			attachments: false,
		};
	}
}
