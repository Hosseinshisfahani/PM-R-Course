from django.urls import path
from . import api_views

urlpatterns = [
    # Cart endpoints
    path('cart/', api_views.CartView.as_view(), name='api_cart'),
    path('cart/add/', api_views.AddToCartView.as_view(), name='api_add_to_cart'),
    path('cart/remove/', api_views.RemoveFromCartView.as_view(), name='api_remove_from_cart'),
    
    # Checkout endpoints
    path('checkout/', api_views.CheckoutView.as_view(), name='api_checkout'),
    
    # Referral code endpoints
    path('referral/validate/', api_views.ValidateReferralCodeView.as_view(), name='api_validate_referral'),
    path('referral/apply/', api_views.ApplyReferralCodeView.as_view(), name='api_apply_referral'),
    path('referral/track/', api_views.TrackReferralView.as_view(), name='api_track_referral'),
    
    # Marketer endpoints
    path('marketers/requests/', api_views.MarketerRequestView.as_view(), name='api_marketer_request'),
    path('marketers/requests/me/', api_views.MyMarketerRequestView.as_view(), name='api_my_marketer_request'),
    path('marketers/codes/', api_views.MarketerCodesView.as_view(), name='api_marketer_codes'),
    path('marketers/commissions/', api_views.MarketerCommissionsView.as_view(), name='api_marketer_commissions'),
]
