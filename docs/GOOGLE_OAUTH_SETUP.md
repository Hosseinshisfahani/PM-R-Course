# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Django medical course platform.

## Prerequisites

- Django project with django-allauth installed
- Google Cloud Console account
- Domain name (for production) or localhost (for development)

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "Medical Course OAuth")
5. Click "Create"

### 1.2 Enable Google+ API
1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Set the following:
   - **Name**: Medical Course Platform
   - **Authorized JavaScript origins**:
     - `http://localhost:8000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:8000/accounts/google/callback/` (for development)
     - `https://yourdomain.com/accounts/google/callback/` (for production)
5. Click "Create"
6. Note down your **Client ID** and **Client Secret**

## Step 2: Environment Configuration

1. Copy `env_example.txt` to `.env`
2. Update the file with your Google credentials:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Stripe Keys (if using)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Step 3: Django Admin Configuration

1. Start your Django server: `python manage.py runserver`
2. Go to `http://localhost:8000/admin/`
3. Login with your superuser credentials
4. Go to "Sites" and update the default site:
   - **Domain name**: `localhost:8000` (for development) or your domain
   - **Display name**: Your site name
5. Go to "Social Applications" > "Add social application"
6. Fill in the form:
   - **Provider**: Google
   - **Name**: Google OAuth
   - **Client ID**: Your Google Client ID
   - **Secret key**: Your Google Client Secret
   - **Sites**: Move your site from "Available sites" to "Chosen sites"
7. Click "Save"

## Step 4: Test the Integration

1. Go to `http://localhost:8000/accounts/login/`
2. You should see a "ورود با Google" (Login with Google) button
3. Click it to test the OAuth flow
4. You should be redirected to Google's consent screen
5. After authorization, you should be redirected back to your site

## Step 5: Production Deployment

### 5.1 Update Google OAuth Credentials
1. In Google Cloud Console, add your production domain to:
   - **Authorized JavaScript origins**
   - **Authorized redirect URIs**
2. Update your `.env` file with production credentials

### 5.2 Update Django Settings
1. Set `DEBUG = False` in production
2. Update `ALLOWED_HOSTS` with your domain
3. Ensure your domain is correctly set in Django admin Sites

### 5.3 Security Considerations
1. Use HTTPS in production
2. Keep your `.env` file secure and never commit it to version control
3. Regularly rotate your OAuth credentials
4. Monitor OAuth usage in Google Cloud Console

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Check that your redirect URI exactly matches what's configured in Google Console
   - Ensure no trailing slashes mismatch

2. **"Client ID not found" error**:
   - Verify your Client ID and Secret are correct in `.env`
   - Check that the Social Application is properly configured in Django admin

3. **"Site not found" error**:
   - Ensure your site is properly configured in Django admin Sites
   - Check that the Social Application is associated with the correct site

4. **CSRF token errors**:
   - The Google callback view is exempt from CSRF, but ensure your templates include `{% csrf_token %}`

### Debug Mode

If you're having issues, temporarily enable debug mode and check the Django logs for detailed error messages.

## Features

With this setup, users can:

- **Login with Google**: Existing users can link their accounts to Google
- **Sign up with Google**: New users can create accounts using Google OAuth
- **Automatic profile creation**: User profiles are automatically created with Google data
- **Seamless authentication**: Users can switch between Google OAuth and traditional login

## Support

If you encounter any issues:

1. Check the Django logs for error messages
2. Verify your Google OAuth configuration
3. Ensure all required packages are installed
4. Check that migrations have been applied

## Package Versions

This setup was tested with:
- Django 4.2.23
- django-allauth 65.11.1
- PyJWT 2.10.1
- cryptography 45.0.6

