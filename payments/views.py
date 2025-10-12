from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cart, CartItem, Purchase, Enrollment, ReferralCode, ReferralUsage, MarketerCommission, MarketerRegistrationRequest
from .forms import JoinMarketersForm
import stripe
import json
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class CartView(LoginRequiredMixin, DetailView):
    template_name = 'payments/cart.html'
    context_object_name = 'cart'
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class ClearCartView(LoginRequiredMixin, View):
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        messages.success(request, 'سبد خرید شما خالی شد.')
        return redirect('payments:cart')

class RemoveFromCartView(LoginRequiredMixin, View):
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_type = request.POST.get('item_type')
        item_id = request.POST.get('item_id')
        
        try:
            if item_type == 'course':
                item = cart.items.filter(course_id=item_id).first()
            elif item_type == 'section':
                item = cart.items.filter(section_id=item_id).first()
            else:
                messages.error(request, 'نوع آیتم نامعتبر است.')
                return redirect('payments:cart')
            
            if item:
                item.delete()
                messages.success(request, 'آیتم از سبد خرید حذف شد.')
            else:
                messages.error(request, 'آیتم در سبد خرید یافت نشد.')
                
        except Exception as e:
            messages.error(request, 'خطا در حذف آیتم از سبد خرید.')
        
        return redirect('payments:cart')

class ApplyReferralCodeView(LoginRequiredMixin, View):
    def post(self, request):
        code = request.POST.get('referral_code', '').strip().upper()
        
        if not code:
            messages.error(request, 'لطفاً کد معرفی را وارد کنید.')
            return redirect('payments:cart')
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        success, message = cart.apply_referral_code(code)
        
        if success:
            messages.success(request, message)
        else:
            messages.error(request, message)
        
        return redirect('payments:cart')

class RemoveReferralCodeView(LoginRequiredMixin, View):
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.remove_referral_code()
        messages.success(request, 'کد معرفی حذف شد.')
        return redirect('payments:cart')

class CheckoutView(LoginRequiredMixin, View):
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            messages.error(request, 'سبد خرید شما خالی است.')
            return redirect('payments:cart')
        
        context = {
            'cart': cart,
            'stripe_public_key': settings.STRIPE_PUBLISHABLE_KEY,
        }
        return render(request, 'payments/checkout.html', context)
    
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        if not cart.items.exists():
            messages.error(request, 'سبد خرید شما خالی است.')
            return redirect('payments:cart')
        
        try:
            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(cart.get_total_amount() * 100),  # Convert to cents
                currency='usd',  # You might want to change this to IRR if supported
                metadata={
                    'user_id': request.user.id,
                    'cart_id': cart.id,
                }
            )
            
            # Calculate total discount amount
            total_discount = cart.get_discount_amount()
            subtotal = cart.get_subtotal()
            
            # Create purchase records
            for item in cart.items.all():
                if item.course:
                    original_amount = item.course.get_effective_price()
                    # Calculate proportional discount for this item
                    item_discount = (original_amount / subtotal) * total_discount if subtotal > 0 else 0
                    final_amount = original_amount - item_discount
                    
                    purchase = Purchase.objects.create(
                        user=request.user,
                        purchase_type='course',
                        course=item.course,
                        amount=final_amount,
                        original_amount=original_amount,
                        discount_amount=item_discount,
                        referral_code=cart.referral_code,
                        transaction_id=intent.id,
                        payment_status='pending'
                    )
                elif item.section:
                    original_amount = item.section.price
                    # Calculate proportional discount for this item
                    item_discount = (original_amount / subtotal) * total_discount if subtotal > 0 else 0
                    final_amount = original_amount - item_discount
                    
                    purchase = Purchase.objects.create(
                        user=request.user,
                        purchase_type='section',
                        section=item.section,
                        amount=final_amount,
                        original_amount=original_amount,
                        discount_amount=item_discount,
                        referral_code=cart.referral_code,
                        transaction_id=intent.id,
                        payment_status='pending'
                    )
            
            return JsonResponse({
                'client_secret': intent.client_secret,
                'success': True
            })
            
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'success': False
            })

class PaymentSuccessView(LoginRequiredMixin, View):
    def get(self, request):
        payment_intent_id = request.GET.get('payment_intent')
        
        if payment_intent_id:
            # Update purchase status
            purchases = Purchase.objects.filter(
                transaction_id=payment_intent_id,
                user=request.user
            )
            
            for purchase in purchases:
                purchase.payment_status = 'completed'
                purchase.save()
                
                # Handle referral commission if applicable
                if purchase.referral_code:
                    # Create referral usage record
                    referral_usage = ReferralUsage.objects.create(
                        referral_code=purchase.referral_code,
                        customer=request.user,
                        purchase=purchase,
                        discount_amount=purchase.discount_amount,
                        commission_amount=(purchase.original_amount * purchase.referral_code.commission_percentage) / 100
                    )
                    
                    # Create marketer commission record
                    MarketerCommission.objects.create(
                        marketer=purchase.referral_code.marketer,
                        referral_usage=referral_usage,
                        amount=referral_usage.commission_amount
                    )
                    
                    # Increment referral code usage
                    purchase.referral_code.increment_usage()
                
                # Create enrollment
                if purchase.course:
                    Enrollment.objects.get_or_create(
                        user=request.user,
                        course=purchase.course,
                        purchase=purchase
                    )
                elif purchase.section:
                    Enrollment.objects.get_or_create(
                        user=request.user,
                        section=purchase.section,
                        purchase=purchase
                    )
            
            # Clear cart and referral code
            cart, created = Cart.objects.get_or_create(user=request.user)
            cart.items.all().delete()
            cart.referral_code = None
            cart.save()
            
            messages.success(request, 'پرداخت شما با موفقیت انجام شد!')
        
        return render(request, 'payments/payment_success.html')

class PaymentCancelView(LoginRequiredMixin, View):
    def get(self, request):
        messages.error(request, 'پرداخت لغو شد.')
        return render(request, 'payments/payment_cancel.html')

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(View):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = 'your_webhook_endpoint_secret'  # Set this in production
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Update purchase status
            purchases = Purchase.objects.filter(transaction_id=payment_intent['id'])
            for purchase in purchases:
                purchase.payment_status = 'completed'
                purchase.save()
        
        return HttpResponse(status=200)

class PurchaseHistoryView(LoginRequiredMixin, ListView):
    model = Purchase
    template_name = 'payments/purchase_history.html'
    context_object_name = 'purchases'
    paginate_by = 10
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user).order_by('-created_at')

class PurchaseDetailView(LoginRequiredMixin, DetailView):
    model = Purchase
    template_name = 'payments/purchase_detail.html'
    context_object_name = 'purchase'
    pk_url_kwarg = 'purchase_id'
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)

# Marketer views for referral management
class MarketerReferralCodesView(LoginRequiredMixin, ListView):
    model = ReferralCode
    template_name = 'payments/marketer_referral_codes.html'
    context_object_name = 'referral_codes'
    
    def get_queryset(self):
        if not self.request.user.is_staff_member():
            return ReferralCode.objects.none()
        return ReferralCode.objects.filter(marketer=self.request.user).order_by('-created_at')

class CreateReferralCodeView(LoginRequiredMixin, View):
    def get(self, request):
        if not request.user.is_staff_member():
            messages.error(request, 'شما مجاز به ایجاد کد معرفی نیستید.')
            return redirect('courses:home')
        return render(request, 'payments/create_referral_code.html')
    
    def post(self, request):
        if not request.user.is_staff_member():
            messages.error(request, 'شما مجاز به ایجاد کد معرفی نیستید.')
            return redirect('courses:home')
        
        discount_percentage = request.POST.get('discount_percentage', 10)
        commission_percentage = request.POST.get('commission_percentage', 10)
        max_uses = request.POST.get('max_uses', '')
        
        try:
            referral_code = ReferralCode.objects.create(
                marketer=request.user,
                discount_percentage=discount_percentage,
                commission_percentage=commission_percentage,
                max_uses=int(max_uses) if max_uses else None
            )
            messages.success(request, f'کد معرفی {referral_code.code} با موفقیت ایجاد شد.')
            return redirect('payments:marketer_referral_codes')
        except Exception as e:
            messages.error(request, f'خطا در ایجاد کد معرفی: {str(e)}')
            return redirect('payments:create_referral_code')

class MarketerCommissionsView(LoginRequiredMixin, ListView):
    model = MarketerCommission
    template_name = 'payments/marketer_commissions.html'
    context_object_name = 'commissions'
    paginate_by = 10
    
    def get_queryset(self):
        if not self.request.user.is_staff_member():
            return MarketerCommission.objects.none()
        return MarketerCommission.objects.filter(marketer=self.request.user).order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_staff_member():
            from django.db import models
            total_commission = MarketerCommission.objects.filter(
                marketer=self.request.user,
                status='paid'
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            pending_commission = MarketerCommission.objects.filter(
                marketer=self.request.user,
                status='pending'
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            context['total_commission'] = total_commission
            context['pending_commission'] = pending_commission
        return context

class JoinMarketersView(LoginRequiredMixin, View):
    def get(self, request):
        # Check if user is already a staff member
        if request.user.is_staff_member():
            messages.info(request, 'شما قبلاً عضو تیم فروشندگان هستید.')
            return redirect('payments:marketer_referral_codes')
        
        # Check if user already has a pending request
        try:
            existing_request = MarketerRegistrationRequest.objects.get(user=request.user)
            if existing_request.status == 'pending':
                messages.info(request, 'درخواست شما در حال بررسی است. لطفاً صبر کنید.')
                return redirect('payments:marketer_request_status')
            elif existing_request.status == 'approved':
                messages.success(request, 'درخواست شما تایید شده است! اکنون می‌توانید از پنل فروشندگان استفاده کنید.')
                return redirect('payments:marketer_referral_codes')
        except MarketerRegistrationRequest.DoesNotExist:
            pass
        
        form = JoinMarketersForm()
        return render(request, 'payments/join_marketers.html', {'form': form})
    
    def post(self, request):
        # Check if user is already a staff member
        if request.user.is_staff_member():
            messages.info(request, 'شما قبلاً عضو تیم فروشندگان هستید.')
            return redirect('payments:marketer_referral_codes')
        
        # Check if user already has a pending request
        try:
            existing_request = MarketerRegistrationRequest.objects.get(user=request.user)
            if existing_request.status == 'pending':
                messages.info(request, 'درخواست شما در حال بررسی است. لطفاً صبر کنید.')
                return redirect('payments:marketer_request_status')
        except MarketerRegistrationRequest.DoesNotExist:
            pass
        
        form = JoinMarketersForm(request.POST)
        if form.is_valid():
            try:
                # Create registration request
                registration_request = MarketerRegistrationRequest.objects.create(
                    user=request.user,
                    full_name=form.cleaned_data['full_name'],
                    phone_number=form.cleaned_data['phone_number'],
                    email=form.cleaned_data['email'],
                    experience_level=form.cleaned_data['experience_level'],
                    current_job=form.cleaned_data.get('current_job'),
                    interest_area=form.cleaned_data['interest_area'],
                    motivation=form.cleaned_data['motivation'],
                    marketing_experience=form.cleaned_data.get('marketing_experience'),
                    instagram_handle=form.cleaned_data.get('instagram_handle'),
                    telegram_handle=form.cleaned_data.get('telegram_handle'),
                )
                
                messages.success(request, 'درخواست شما با موفقیت ارسال شد! به زودی با شما تماس خواهیم گرفت.')
                return redirect('payments:marketer_request_status')
                
            except Exception as e:
                messages.error(request, f'خطا در ارسال درخواست: {str(e)}')
        
        return render(request, 'payments/join_marketers.html', {'form': form})

class MarketerRequestStatusView(LoginRequiredMixin, View):
    def get(self, request):
        try:
            registration_request = MarketerRegistrationRequest.objects.get(user=request.user)
            return render(request, 'payments/marketer_request_status.html', {
                'request': registration_request
            })
        except MarketerRegistrationRequest.DoesNotExist:
            messages.info(request, 'شما هنوز درخواستی ارسال نکرده‌اید.')
            return redirect('payments:join_marketers')
