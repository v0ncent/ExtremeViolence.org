# Authentication Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Auth.js Configuration
# Generate a random string for AUTH_SECRET (you can use: openssl rand -base64 32)
AUTH_SECRET=your-auth-secret-here

# Google OAuth Configuration
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth Configuration (optional)
# Get these from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NodeMailer Configuration (for contact form)
CONTACT_EMAIL=your-email@gmail.com
CONTACT_EMAIL_PASS=your-gmail-app-password
```

## How to Get OAuth Credentials

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback/google` (for development)
   - `https://yourdomain.com/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret

### GitHub OAuth Setup:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details
4. Set the Authorization callback URL to:
   - `http://localhost:5173/auth/callback/github` (for development)
   - `https://yourdomain.com/auth/callback/github` (for production)
5. Copy the Client ID and Client Secret

## Testing the Setup

After setting up your environment variables, you can test them by visiting:
- `/api/auth/check-env` - Check if all environment variables are set
- `/api/auth/debug` - Debug session token issues

## Common Issues

1. **"JWSInvalid: Invalid Compact JWS"** - This usually means the `AUTH_SECRET` is not set or is incorrect
2. **"No session token found"** - User is not logged in or session cookie is missing
3. **"Failed to decrypt token"** - `AUTH_SECRET` mismatch between when the token was created and when it's being decrypted 