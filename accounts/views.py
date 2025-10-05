# This file now only contains API views and OAuth functionality
# Template-based views have been migrated to React frontend

from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib import messages
from django.conf import settings
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .models import User

# Google OAuth views (keeping for backward compatibility)
def google_login(request):
    """Redirect to Google OAuth"""
    from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
    from allauth.socialaccount.providers.oauth2.client import OAuth2Client
    
    # Get the Google OAuth2 adapter
    adapter = GoogleOAuth2Adapter()
    client = OAuth2Client(
        client_id=settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
        client_secret=settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_secret'],
        callback_url=request.build_absolute_uri(reverse_lazy('accounts:google_callback')),
        scope=settings.SOCIALACCOUNT_PROVIDERS['google']['SCOPE'],
    )
    
    # Generate authorization URL
    authorization_url = client.get_authorization_url(adapter.authorize_url, {})
    return redirect(authorization_url)

@csrf_exempt
def google_callback(request):
    """Handle Google OAuth callback"""
    from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
    from allauth.socialaccount.providers.oauth2.client import OAuth2Client
    from allauth.socialaccount.models import SocialAccount
    
    try:
        # Get the authorization code from the callback
        code = request.GET.get('code')
        if not code:
            messages.error(request, 'خطا در احراز هویت Google')
            return redirect('accounts:login')
        
        # Exchange code for access token
        adapter = GoogleOAuth2Adapter()
        client = OAuth2Client(
            client_id=settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
            client_secret=settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_secret'],
            callback_url=request.build_absolute_uri(reverse_lazy('accounts:google_callback')),
        )
        
        # Get access token
        token = client.get_provider_social_auth_token(adapter, app=None, token=code)
        
        # Get user info from Google
        user_info = adapter.get_provider_data(token)
        
        # Check if user already exists
        try:
            social_account = SocialAccount.objects.get(provider='google', uid=user_info['id'])
            user = social_account.user
            login(request, user)
            messages.success(request, f'خوش آمدید {user.get_full_name() or user.username}!')
            return redirect('/')  # Redirect to React home page
        except SocialAccount.DoesNotExist:
            # Create new user
            email = user_info.get('email')
            if not email:
                messages.error(request, 'ایمیل از Google دریافت نشد')
                return redirect('/login')  # Redirect to React login page
            
            # Check if user with this email already exists
            try:
                user = User.objects.get(email=email)
                # Link existing user to Google account
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=user_info['id'],
                    extra_data=user_info
                )
                login(request, user)
                messages.success(request, f'حساب کاربری شما به Google متصل شد!')
                return redirect('/')  # Redirect to React home page
            except User.DoesNotExist:
                # Create new user
                username = user_info.get('name', email.split('@')[0])
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=user_info.get('given_name', ''),
                    last_name=user_info.get('family_name', ''),
                    user_type='customer'
                )
                
                # Create social account
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=user_info['id'],
                    extra_data=user_info
                )
                
                login(request, user)
                messages.success(request, 'حساب کاربری شما با Google ایجاد شد!')
                return redirect('/')  # Redirect to React home page
                
    except Exception as e:
        messages.error(request, f'خطا در احراز هویت: {str(e)}')
        return redirect('/login')  # Redirect to React login page