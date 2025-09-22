from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from django.contrib.auth import login
from django.views.generic import CreateView, DetailView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.conf import settings
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .forms import CustomUserCreationForm, ProfileUpdateForm

class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return reverse_lazy('courses:home')

class SignUpView(CreateView):
    model = User
    form_class = CustomUserCreationForm
    template_name = 'accounts/signup.html'
    success_url = reverse_lazy('courses:home')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        login(self.request, self.object)
        messages.success(self.request, 'حساب کاربری شما با موفقیت ایجاد شد!')
        return response

class ProfileView(LoginRequiredMixin, DetailView):
    model = User
    template_name = 'accounts/profile.html'
    context_object_name = 'profile_user'
    
    def get_object(self):
        return self.request.user

class ProfileEditView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = ProfileUpdateForm
    template_name = 'accounts/profile_edit.html'
    success_url = reverse_lazy('accounts:profile')
    
    def get_object(self):
        return self.request.user
    
    def form_valid(self, form):
        messages.success(self.request, 'پروفایل شما با موفقیت به‌روزرسانی شد!')
        return super().form_valid(form)

# Google OAuth views
def google_login(request):
    """Redirect to Google OAuth"""
    from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
    from allauth.socialaccount.providers.oauth2.client import OAuth2Client
    from allauth.socialaccount.providers.google.provider import GoogleProvider
    
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
    from allauth.socialaccount.providers.google.provider import GoogleProvider
    from allauth.socialaccount.models import SocialAccount
    from allauth.socialaccount.helpers import complete_social_login
    from allauth.socialaccount.helpers import render_authentication_error
    from allauth.socialaccount.helpers import process_authentication_error
    
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
            return redirect('courses:home')
        except SocialAccount.DoesNotExist:
            # Create new user
            email = user_info.get('email')
            if not email:
                messages.error(request, 'ایمیل از Google دریافت نشد')
                return redirect('accounts:login')
            
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
                return redirect('courses:home')
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
                return redirect('courses:home')
                
    except Exception as e:
        messages.error(request, f'خطا در احراز هویت: {str(e)}')
        return redirect('accounts:login')
