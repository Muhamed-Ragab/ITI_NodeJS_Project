import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { logDevError } from "../../utils/logger.js";

let transporter = null;

const isMailerConfigured = () => {
	return Boolean(
		env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS
	);
};

const getTransporter = () => {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			secure: Number(env.SMTP_PORT) === 465,
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASS,
			},
		});
	}

	return transporter;
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

	const from = env.MAIL_FROM || env.SMTP_FROM || env.SMTP_USER;
	const result = await getTransporter().sendMail({
		from,
		to,
		subject,
		text,
		html,
	});

	return {
		sent: true,
		messageId: result.messageId,
	};
};
