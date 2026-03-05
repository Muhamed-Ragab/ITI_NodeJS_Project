# Email Setup Guide for Railway Deployment

This guide explains how to configure email services using Resend to work properly on Railway, ensuring that your registration and OTP functionality works as expected.

## Problem
When deploying to Railway, email services often fail to send because Resend API key is not configured, causing registration to hang and not return responses to your Angular app.

## Solution: Resend (Recommended)

1. **Sign up at Resend** (https://resend.com)
2. **Get your API Key** from the Resend dashboard
3. **Set Environment Variables in Railway**:
   ```
   RESEND_API_KEY=your-resend-api-key
   MAIL_FROM=your-domain@resend.dev (or your verified domain)
   ```

## Railway Environment Variable Setup

1. **Go to your Railway project dashboard**
2. **Navigate to the "Variables" tab**
3. **Add the Resend variables** as shown above
4. **Redeploy your application** for changes to take effect

## Testing Email Configuration

After setting up the environment variables:

1. **Test registration** from your Angular app
2. **Monitor Railway logs** to see if emails are being sent successfully
3. **Check your inbox** for verification emails

## Getting Started with Resend

### 1. Verify Your Domain
- Go to Resend Dashboard → Domains
- Click "Create Domain" 
- Follow DNS verification steps
- Once verified, you can send emails from your domain

### 2. API Key Security
- Keep your API key secure
- Use environment variables (already configured in the app)
- Don't commit API keys to version control

## Troubleshooting Common Issues

### Issue: Email sending fails with API key error
**Solution**: Verify your Resend API key is correctly set in Railway variables

### Issue: Emails go to spam
**Solution**: Ensure your domain is properly verified in Resend dashboard

### Issue: Rate limiting
**Solution**: Check Resend's rate limits (100 emails/month free tier)

## Configuration Validation

To validate your email configuration, you can monitor Railway logs for email sending status.

## Production Considerations

- **Use verified domains** for better deliverability
- **Monitor email statistics** in Resend dashboard
- **Handle email sending errors** gracefully
- **Consider email templates** for better formatting

## Environment Variables Reference

Required variables for email functionality:
- `RESEND_API_KEY` - Your Resend API key from the dashboard
- `MAIL_FROM` - Email address to send from (optional, defaults to onboarding@resend.dev)

Your application will automatically handle email sending when these variables are properly configured on Railway.