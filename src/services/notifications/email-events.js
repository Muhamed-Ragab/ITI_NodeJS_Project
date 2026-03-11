import { EventEmitter } from "node:events";
import { logDevError } from "../../utils/logger.js";

/**
 * Email Event Emitter
 * Handles all email-related events in the application
 */
class EmailEventEmitter extends EventEmitter {
	constructor() {
		super();
		this.setMaxListeners(20); // Increase if needed
		this.pendingEmails = new Map(); // Track pending email operations
	}

	/**
	 * Emit verification email event
	 */
	emitVerificationEmail({ email, name, token }) {
		this.emit("email:verification", { email, name, token });
	}

	/**
	 * Emit OTP email event
	 */
	emitOtpEmail({ email, name, otp }) {
		this.emit("email:otp", { email, name, otp });
	}

	/**
	 * Emit password reset email event
	 */
	emitPasswordResetEmail({ email, name, resetLink }) {
		this.emit("email:password-reset", { email, name, resetLink });
	}

	/**
	 * Emit welcome email event
	 */
	emitWelcomeEmail({ email, name }) {
		this.emit("email:welcome", { email, name });
	}

	/**
	 * Emit email sent success event
	 */
	emitEmailSent({ type, email, messageId }) {
		this.emit("email:sent", { type, email, messageId, timestamp: new Date() });
	}

	/**
	 * Emit email failed event
	 */
	emitEmailFailed({ type, email, error }) {
		this.emit("email:failed", { type, email, error, timestamp: new Date() });
	}

	/**
	 * Wait for all pending emails to complete
	 * Useful for serverless environments like Vercel
	 */
	async waitForPendingEmails(timeout = 5000) {
		if (this.pendingEmails.size === 0) {
			return;
		}

		const promises = Array.from(this.pendingEmails.values());
		try {
			await Promise.race([
				Promise.all(promises),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Email timeout")), timeout)
				),
			]);
		} catch (error) {
			logDevError({
				scope: "email-events.wait",
				message: "Error waiting for pending emails",
				error,
			});
		}
	}
}

// Singleton instance
export const emailEvents = new EmailEventEmitter();

/**
 * Register email event listeners
 * This function should be called once during app initialization
 */
export const registerEmailEventListeners = (emailService) => {
	// Verification email listener
	emailEvents.on("email:verification", (data) => {
		const emailKey = `verification-${data.email}-${Date.now()}`;
		const promise = (async () => {
			try {
				const result = await emailService.sendVerificationEmail(data);
				emailEvents.emitEmailSent({
					type: "verification",
					email: data.email,
					messageId: result.messageId,
				});
			} catch (error) {
				logDevError({
					scope: "email-events.verification",
					message: "Failed to send verification email",
					error,
					meta: { email: data.email },
				});
				emailEvents.emitEmailFailed({
					type: "verification",
					email: data.email,
					error: error.message,
				});
			} finally {
				emailEvents.pendingEmails.delete(emailKey);
			}
		})();
		emailEvents.pendingEmails.set(emailKey, promise);
	});

	// OTP email listener
	emailEvents.on("email:otp", (data) => {
		const emailKey = `otp-${data.email}-${Date.now()}`;
		const promise = (async () => {
			try {
				const result = await emailService.sendEmailOtp(data);
				emailEvents.emitEmailSent({
					type: "otp",
					email: data.email,
					messageId: result.messageId,
				});
			} catch (error) {
				logDevError({
					scope: "email-events.otp",
					message: "Failed to send OTP email",
					error,
					meta: { email: data.email },
				});
				emailEvents.emitEmailFailed({
					type: "otp",
					email: data.email,
					error: error.message,
				});
			} finally {
				emailEvents.pendingEmails.delete(emailKey);
			}
		})();
		emailEvents.pendingEmails.set(emailKey, promise);
	});

	// Password reset email listener
	emailEvents.on("email:password-reset", (data) => {
		const emailKey = `password-reset-${data.email}-${Date.now()}`;
		const promise = (async () => {
			try {
				const result = await emailService.sendPasswordResetEmail(data);
				emailEvents.emitEmailSent({
					type: "password-reset",
					email: data.email,
					messageId: result.messageId,
				});
			} catch (error) {
				logDevError({
					scope: "email-events.password-reset",
					message: "Failed to send password reset email",
					error,
					meta: { email: data.email },
				});
				emailEvents.emitEmailFailed({
					type: "password-reset",
					email: data.email,
					error: error.message,
				});
			} finally {
				emailEvents.pendingEmails.delete(emailKey);
			}
		})();
		emailEvents.pendingEmails.set(emailKey, promise);
	});

	// Welcome email listener
	emailEvents.on("email:welcome", (data) => {
		const emailKey = `welcome-${data.email}-${Date.now()}`;
		const promise = (async () => {
			try {
				const result = await emailService.sendWelcomeEmail(data);
				emailEvents.emitEmailSent({
					type: "welcome",
					email: data.email,
					messageId: result.messageId,
				});
			} catch (error) {
				logDevError({
					scope: "email-events.welcome",
					message: "Failed to send welcome email",
					error,
					meta: { email: data.email },
				});
				emailEvents.emitEmailFailed({
					type: "welcome",
					email: data.email,
					error: error.message,
				});
			} finally {
				emailEvents.pendingEmails.delete(emailKey);
			}
		})();
		emailEvents.pendingEmails.set(emailKey, promise);
	});

	// Success logging listener
	emailEvents.on("email:sent", (data) => {
		console.log(`✅ Email sent successfully: ${data.type} to ${data.email}`);
	});

	// Failure logging listener
	emailEvents.on("email:failed", (data) => {
		console.error(
			`❌ Email failed: ${data.type} to ${data.email} - ${data.error}`
		);
	});

	console.log("📧 Email event listeners registered");
};
