# Auth Module

This module handles all user authentication-related functionalities, including user registration, login, and Google OAuth integration.

## Purpose
- **User Identity:** Manage user identity and access to the system.
- **Security:** Ensure secure user authentication and session management using JWT.
- **Flexibility:** Provide multiple authentication methods (email/password, social login).

## Key Functionalities
-   User Registration (email/password)
-   User Login (email/password)
-   Google OAuth 2.0 based Login/Registration
-   JWT Token Generation and Verification

## Expected API Endpoints
-   `POST /api/auth/register`
-   `POST /api/auth/login`
-   `GET /api/auth/google` (Initiate Google OAuth flow)
-   `GET /api/auth/google/callback` (Google OAuth callback handler)