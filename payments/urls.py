from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Cart
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/clear/', views.ClearCartView.as_view(), name='clear_cart'),
    path('cart/remove/', views.RemoveFromCartView.as_view(), name='remove_from_cart'),
    path('cart/apply-referral/', views.ApplyReferralCodeView.as_view(), name='apply_referral_code'),
    path('cart/remove-referral/', views.RemoveReferralCodeView.as_view(), name='remove_referral_code'),
    
    # Checkout
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
    path('checkout/success/', views.PaymentSuccessView.as_view(), name='payment_success'),
    path('checkout/cancel/', views.PaymentCancelView.as_view(), name='payment_cancel'),
    
    # Stripe webhooks
    path('webhook/stripe/', views.StripeWebhookView.as_view(), name='stripe_webhook'),
    
    # Purchase history
    path('purchases/', views.PurchaseHistoryView.as_view(), name='purchase_history'),
    path('purchase/<uuid:purchase_id>/', views.PurchaseDetailView.as_view(), name='purchase_detail'),
    
    # Marketer referral management
    path('marketer/referral-codes/', views.MarketerReferralCodesView.as_view(), name='marketer_referral_codes'),
    path('marketer/create-referral-code/', views.CreateReferralCodeView.as_view(), name='create_referral_code'),
    path('marketer/commissions/', views.MarketerCommissionsView.as_view(), name='marketer_commissions'),
    
    # Join marketers
    path('join-marketers/', views.JoinMarketersView.as_view(), name='join_marketers'),
    path('marketer-request-status/', views.MarketerRequestStatusView.as_view(), name='marketer_request_status'),
]
