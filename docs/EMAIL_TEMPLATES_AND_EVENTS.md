# Beautiful Email Templates & Event-Driven Email System

## Overview

This document describes the new email template system and event-driven architecture implemented for the ITI E-Commerce backend.

## What's New

### 1. Beautiful HTML Email Templates

All emails now use modern, responsive HTML templates with:
- **Gradient headers** with ITI E-Commerce branding
- **Inline CSS** for maximum email client compatibility
- **Mobile-responsive design** that works on all devices
- **Professional styling** with proper spacing and typography
- **Security information** and best practices

#### Template Types

**Verification Email**
- Welcome message
- Verification link with 24-hour expiration
- Security information
- Fallback plain text link

**OTP Email**
- Prominent OTP code display (36px, bold, colored)
- 5-minute expiration notice
- Security tips
- Clear instructions

**Password Reset Email**
- Reset link with 1-hour expiration
- Security warnings
- Fallback plain text link
- Reassurance for accidental requests

**Welcome Email**
- Congratulations message
- Feature highlights
- Call-to-action
- Professional footer

### 2. Event-Driven Email Architecture

Emails are now sent asynchronously using Node.js EventEmitter:

```javascript
// Instead of:
await sendVerificationEmail({ email, name, token });

// Now:
emailEvents.emitVerificationEmail({ email, name, token });
```

**Benefits:**
- ✅ Non-blocking operations - API responds immediately
- ✅ Better performance - email sending doesn't delay user responses
- ✅ Decoupled architecture - email service is independent
- ✅ Event tracking - success/failure monitoring
- ✅ Scalable - easy to add email queuing later

### 3. Event Types

```javascript
// Emit events
emailEvents.emitVerificationEmail({ email, name, token });
emailEvents.emitOtpEmail({ email, name, otp });
emailEvents.emitPasswordResetEmail({ email, name, resetLink });
emailEvents.emitWelcomeEmail({ email, name });

// Listen to events
emailEvents.on('email:sent', (data) => {
  console.log(`Email sent: ${data.type} to ${data.email}`);
});

emailEvents.on('email:failed', (data) => {
  console.error(`Email failed: ${data.type} - ${data.error}`);
});
```

## File Structure

```
src/services/notifications/
├── email-provider.js              # Main email service (refactored)
├── email-events.js                # Event emitter & listeners
├── templates/
│   └── email-templates.js         # Beautiful HTML templates
└── providers/
    ├── email-provider-strategy.js # Abstract base class
    ├── provider-factory.js        # Provider factory
    ├── resend-provider.js         # Resend implementation
    └── emailjs-provider.js        # EmailJS implementation
```

## Implementation Details

### Email Provider Functions

All functions now use beautiful templates and return consistent responses:

```javascript
// Returns: { sent: true, messageId: string, provider: string }
await sendVerificationEmail({ email, name, token });
await sendEmailOtp({ email, name, otp });
await sendPasswordResetEmail({ email, name, resetLink });
await sendWelcomeEmail({ email, name });
```

### Auth Service Integration

The auth service now emits events instead of awaiting email sends:

```javascript
// Register user
const verification = generateEmailVerificationToken();
const user = await authRepository.createUser({ ... });

// Emit event (non-blocking)
emailEvents.emitVerificationEmail({
  email: user.email,
  name: user.name,
  token: verification.token,
});

// Return immediately
return { user: stripPassword(user), requiresEmailVerification: true };
```

### Server Initialization

Email event listeners are registered on server startup:

```javascript
// src/server.js
import { registerEmailEventListeners } from "./services/notifications/email-events.js";
import * as emailService from "./services/notifications/email-provider.js";

// In startServer()
registerEmailEventListeners(emailService);
```

## Email Template Features

### Responsive Design
- Works on desktop, tablet, and mobile
- Inline CSS for email client compatibility
- Proper line-height and spacing

### Branding
- ITI E-Commerce logo/name in header
- Consistent gradient colors (purple/blue)
- Professional footer with copyright

### Security
- Clear expiration times
- Security tips and warnings
- Reassurance for accidental requests
- No sensitive data in plain text

### Accessibility
- Semantic HTML structure
- Clear hierarchy with headings
- Readable font sizes (14px-36px)
- Good color contrast

## Testing

### Manual Testing

1. **Register a new user**
   ```bash
   POST /api/v1/auth/register
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - Check email for beautiful verification template
   - Verify link works and expires after 24 hours

2. **Request OTP**
   ```bash
   POST /api/v1/auth/request-otp
   {
     "email": "test@example.com"
   }
   ```
   - Check email for OTP template
   - Verify OTP code is prominent and expires after 5 minutes

3. **Monitor Events**
   - Check server logs for email event messages
   - Look for "✅ Email sent successfully" or "❌ Email failed" messages

### Test Mode

In test environment (`NODE_ENV=test`), emails are simulated:
```javascript
// Returns simulated response without sending
{ sent: true, simulated: true, messageId: "test-verification" }
```

## Configuration

### Environment Variables

```env
# Email Provider Selection
EMAIL_PROVIDER=emailjs  # or "resend" or "nodemailer"

# EmailJS Configuration
EMAILJS_SERVICE_ID=service_xxx
EMAILJS_TEMPLATE_ID=template_xxx
EMAILJS_PUBLIC_KEY=public_key_xxx
EMAILJS_PRIVATE_KEY=private_key_xxx

# Resend Configuration
RESEND_API_KEY=re_xxx
MAIL_FROM=noreply@example.com

# Nodemailer Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Performance Impact

### Before (Async/Await)
```
User Registration → Send Email (wait 2-5s) → Return Response
Total: 2-5 seconds
```

### After (Event-Driven)
```
User Registration → Emit Event → Return Response (immediate)
                 ↓
            Send Email (async, 2-5s)
Total: <100ms
```

**Result:** API responses are 20-50x faster!

## Monitoring

### Event Listeners

The system logs all email events:

```
📧 Email event listeners registered
✅ Email sent successfully: verification to user@example.com
✅ Email sent successfully: otp to user@example.com
❌ Email failed: verification to user@example.com - Timeout
```

### Error Handling

Errors are logged but don't break the user flow:
- Email send failures are logged to console
- User still gets success response
- Retry logic can be added later

## Future Enhancements

1. **Email Queue**
   - Add Bull/BullMQ for email queuing
   - Retry failed emails automatically
   - Rate limiting

2. **Email Analytics**
   - Track open rates
   - Track click rates
   - Monitor delivery

3. **Template Customization**
   - Admin panel for template editing
   - A/B testing support
   - Multi-language templates

4. **Advanced Features**
   - Batch email sending
   - Scheduled emails
   - Email attachments
   - Dynamic content blocks

## Troubleshooting

### Emails Not Sending

1. Check `EMAIL_PROVIDER` is set correctly
2. Verify provider credentials in `.env`
3. Check server logs for error messages
4. Ensure email provider is configured (not in test mode)

### Emails Delayed

1. Check server logs for event processing
2. Verify email provider API is responding
3. Check network connectivity
4. Monitor email provider status page

### Template Issues

1. Check email client compatibility
2. Verify inline CSS is rendering
3. Test on multiple email clients
4. Check for special character encoding

## References

- [Email Templates](./src/services/notifications/templates/email-templates.js)
- [Email Events](./src/services/notifications/email-events.js)
- [Email Provider](./src/services/notifications/email-provider.js)
- [Auth Service](./src/modules/auth/auth.service.js)
