import { Resend } from "resend";
import { env } from "../../config/env.js";
import { logDevError } from "../../utils/logger.js";

let resend = null;

const isMailerConfigured = () => {
	return Boolean(env.RESEND_API_KEY);
};

const getResend = () => {
	if (!resend && env.RESEND_API_KEY) {
		resend = new Resend(env.RESEND_API_KEY);
	}
	return resend;
};

export const sendMail = async ({ to, subject, text, html }) => {
	if (!(to && subject && (text || html))) {
		return { sent: false, reason: "missing-required-fields" };
	}

	if (!isMailerConfigured() || env.NODE_ENV === "test") {
		logDevError({
			scope: "notifications.mailer",
			message: "Email send simulated",
			meta: { to, subject, text, html },
		});

		return { sent: true, simulated: true };
	}

	const from = env.MAIL_FROM || env.SMTP_FROM || "onboarding@resend.dev";

	// Add timeout to prevent hanging
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error("Email send timeout")), 10_000); // 10 second timeout
	});

	try {
		const resendInstance = getResend();
		const sendPromise = resendInstance.emails.send({
			from,
			to,
			subject,
			text,
			html,
		});

		const result = await Promise.race([sendPromise, timeoutPromise]);

		return {
			sent: true,
			messageId: result.data?.id || result.id,
		};
	} catch (error) {
		console.error("Email sending failed:", error);
		throw error; // Re-throw to let the calling function handle it
	}
};
