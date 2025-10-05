from django.urls import path
from . import api_views

urlpatterns = [
    path('me/', api_views.UserProfileView.as_view(), name='api_user_profile'),
    path('login/', api_views.LoginView.as_view(), name='api_login'),
    path('logout/', api_views.LogoutView.as_view(), name='api_logout'),
    path('signup/', api_views.SignupView.as_view(), name='api_signup'),
]
