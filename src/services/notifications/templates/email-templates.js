/**
 * Beautiful HTML Email Templates
 * Modern, responsive email templates with inline CSS
 */

const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f4f7fa;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .email-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
    text-align: center;
  }
  .email-logo {
    font-size: 32px;
    font-weight: bold;
    color: #ffffff;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .email-body {
    padding: 40px 30px;
  }
  .email-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 20px 0;
  }
  .email-text {
    font-size: 16px;
    line-height: 1.6;
    color: #4a5568;
    margin: 0 0 20px 0;
  }
  .email-button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    transition: transform 0.2s;
  }
  .email-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
  }
  .otp-code {
    display: inline-block;
    font-size: 36px;
    font-weight: bold;
    color: #667eea;
    background-color: #f7fafc;
    padding: 20px 40px;
    border-radius: 12px;
    letter-spacing: 8px;
    margin: 20px 0;
    border: 2px dashed #667eea;
  }
  .email-footer {
    background-color: #f7fafc;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }
  .footer-text {
    font-size: 14px;
    color: #718096;
    margin: 5px 0;
  }
  .footer-link {
    color: #667eea;
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
    margin: 30px 0;
  }
  .info-box {
    background-color: #edf2f7;
    border-left: 4px solid #667eea;
    padding: 15px 20px;
    margin: 20px 0;
    border-radius: 4px;
  }
  .info-box-text {
    font-size: 14px;
    color: #4a5568;
    margin: 0;
  }
  .icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
`;

/**
 * Email verification template
 */
export const verificationEmailTemplate = ({ name, verificationLink }) => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-logo">🛍️ ITI E-Commerce</h1>
    </div>

    <div class="email-body">
      <div class="icon">✉️</div>
      <h2 class="email-title">Welcome, ${name || "there"}! 👋</h2>

      <p class="email-text">
        Thank you for joining ITI E-Commerce! We're excited to have you on board.
      </p>

      <p class="email-text">
        To get started, please verify your email address by clicking the button below:
      </p>

      <div style="text-align: center;">
        <a href="${verificationLink}" class="email-button">
          ✓ Verify Email Address
        </a>
      </div>

      <div class="divider"></div>

      <div class="info-box">
        <p class="info-box-text">
          <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
        </p>
      </div>

      <p class="email-text" style="font-size: 14px; color: #718096;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p class="email-text" style="font-size: 12px; word-break: break-all; color: #667eea;">
        ${verificationLink}
      </p>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>ITI E-Commerce</strong>
      </p>
      <p class="footer-text">
        Your trusted online shopping destination
      </p>
      <div class="divider" style="margin: 20px 0;"></div>
      <p class="footer-text">
        If you didn't create an account, please ignore this email.
      </p>
      <p class="footer-text">
        © ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

	const text = `
Hi ${name || "there"},

Welcome to ITI E-Commerce!

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

---
ITI E-Commerce
Your trusted online shopping destination
© ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
  `.trim();

	return { html, text };
};

/**
 * OTP email template
 */
export const otpEmailTemplate = ({ name, otp }) => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-logo">🛍️ ITI E-Commerce</h1>
    </div>

    <div class="email-body">
      <div class="icon">🔐</div>
      <h2 class="email-title">Your Login Code</h2>

      <p class="email-text">
        Hi ${name || "there"},
      </p>

      <p class="email-text">
        You requested a one-time password to log in to your account. Use the code below:
      </p>

      <div style="text-align: center;">
        <div class="otp-code">${otp}</div>
      </div>

      <div class="info-box">
        <p class="info-box-text">
          <strong>⏰ Expires in 5 minutes</strong> - This code is valid for a short time only.
        </p>
      </div>

      <div class="divider"></div>

      <p class="email-text" style="font-size: 14px; color: #718096;">
        <strong>Security Tips:</strong>
      </p>
      <ul style="color: #718096; font-size: 14px; line-height: 1.8;">
        <li>Never share this code with anyone</li>
        <li>ITI E-Commerce will never ask for your code via phone or email</li>
        <li>If you didn't request this code, please secure your account immediately</li>
      </ul>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>ITI E-Commerce</strong>
      </p>
      <p class="footer-text">
        Your trusted online shopping destination
      </p>
      <div class="divider" style="margin: 20px 0;"></div>
      <p class="footer-text">
        If you didn't request this code, please ignore this email or contact support.
      </p>
      <p class="footer-text">
        © ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

	const text = `
Hi ${name || "there"},

Your one-time password (OTP) for logging in to ITI E-Commerce:

${otp}

This code expires in 5 minutes.

Security Tips:
- Never share this code with anyone
- ITI E-Commerce will never ask for your code via phone or email
- If you didn't request this code, please secure your account immediately

---
ITI E-Commerce
Your trusted online shopping destination
© ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
  `.trim();

	return { html, text };
};

/**
 * Password reset email template
 */
export const passwordResetEmailTemplate = ({ name, resetLink }) => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-logo">🛍️ ITI E-Commerce</h1>
    </div>

    <div class="email-body">
      <div class="icon">🔑</div>
      <h2 class="email-title">Reset Your Password</h2>

      <p class="email-text">
        Hi ${name || "there"},
      </p>

      <p class="email-text">
        We received a request to reset your password. Click the button below to create a new password:
      </p>

      <div style="text-align: center;">
        <a href="${resetLink}" class="email-button">
          🔄 Reset Password
        </a>
      </div>

      <div class="divider"></div>

      <div class="info-box">
        <p class="info-box-text">
          <strong>⏰ Important:</strong> This password reset link will expire in 1 hour for security reasons.
        </p>
      </div>

      <p class="email-text" style="font-size: 14px; color: #718096;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p class="email-text" style="font-size: 12px; word-break: break-all; color: #667eea;">
        ${resetLink}
      </p>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>ITI E-Commerce</strong>
      </p>
      <p class="footer-text">
        Your trusted online shopping destination
      </p>
      <div class="divider" style="margin: 20px 0;"></div>
      <p class="footer-text">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
      <p class="footer-text">
        © ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

	const text = `
Hi ${name || "there"},

We received a request to reset your password for your ITI E-Commerce account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

---
ITI E-Commerce
Your trusted online shopping destination
© ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
  `.trim();

	return { html, text };
};

/**
 * Welcome email template (after email verification)
 */
export const welcomeEmailTemplate = ({ name }) => {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ITI E-Commerce</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-logo">🛍️ ITI E-Commerce</h1>
    </div>

    <div class="email-body">
      <div class="icon">🎉</div>
      <h2 class="email-title">Welcome to ITI E-Commerce! 🎊</h2>

      <p class="email-text">
        Hi ${name || "there"},
      </p>

      <p class="email-text">
        Your email has been successfully verified! You're all set to start shopping.
      </p>

      <p class="email-text">
        <strong>What's next?</strong>
      </p>

      <ul style="color: #4a5568; font-size: 16px; line-height: 1.8;">
        <li>Browse thousands of products</li>
        <li>Add items to your wishlist</li>
        <li>Enjoy secure checkout</li>
        <li>Track your orders in real-time</li>
      </ul>

      <div class="divider"></div>

      <p class="email-text">
        Happy shopping! 🛒
      </p>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>ITI E-Commerce</strong>
      </p>
      <p class="footer-text">
        Your trusted online shopping destination
      </p>
      <div class="divider" style="margin: 20px 0;"></div>
      <p class="footer-text">
        © ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

	const text = `
Hi ${name || "there"},

Welcome to ITI E-Commerce! 🎉

Your email has been successfully verified! You're all set to start shopping.

What's next?
- Browse thousands of products
- Add items to your wishlist
- Enjoy secure checkout
- Track your orders in real-time

Happy shopping! 🛒

---
ITI E-Commerce
Your trusted online shopping destination
© ${new Date().getFullYear()} ITI E-Commerce. All rights reserved.
  `.trim();

	return { html, text };
};
