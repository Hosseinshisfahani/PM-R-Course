from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    Cart, CartItem, ReferralCode, MarketerRegistrationRequest,
    MarketerCommission, Purchase, ReferralUsage
)
from courses.models import Course, Section
from .serializers import (
    CartSerializer, ReferralCodeSerializer, MarketerRequestSerializer,
    MarketerCommissionSerializer, PurchaseSerializer
)


class CartView(APIView):
    """Get user's cart"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    """Add item to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        course_id = request.data.get('course_id')
        section_id = request.data.get('section_id')
        
        if not course_id and not section_id:
            return Response(
                {'error': 'Either course_id or section_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if course_id and section_id:
            return Response(
                {'error': 'Cannot add both course and section'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        try:
            if course_id:
                course = get_object_or_404(Course, id=course_id, is_published=True)
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart, course=course
                )
                if not created:
                    return Response(
                        {'error': 'Course already in cart'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                section = get_object_or_404(Section, id=section_id)
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart, section=section
                )
                if not created:
                    return Response(
                        {'error': 'Section already in cart'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class RemoveFromCartView(APIView):
    """Remove item from cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response(
                {'error': 'item_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
            cart_item.delete()
            
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ValidateReferralCodeView(APIView):
    """Validate referral code"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        code = request.query_params.get('code')
        
        if not code:
            return Response(
                {'error': 'Code parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            referral_code = ReferralCode.objects.get(code=code, is_active=True)
            
            if referral_code.is_available():
                return Response({
                    'valid': True,
                    'discount_type': 'percentage',
                    'value': float(referral_code.discount_percentage),
                    'reason': 'Valid referral code'
                })
            else:
                return Response({
                    'valid': False,
                    'reason': 'Referral code is no longer available'
                })
        except ReferralCode.DoesNotExist:
            return Response({
                'valid': False,
                'reason': 'Invalid referral code'
            })


class ApplyReferralCodeView(APIView):
    """Apply referral code to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': 'Code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        success, message = cart.apply_referral_code(code)
        
        if success:
            serializer = CartSerializer(cart)
            return Response({
                'message': message,
                'cart': serializer.data
            })
        else:
            return Response(
                {'error': message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request):
        """Remove referral code from cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.remove_referral_code()
        
        serializer = CartSerializer(cart)
        return Response({
            'message': 'Referral code removed',
            'cart': serializer.data
        })


class TrackReferralView(APIView):
    """Track referral code usage (for landing pages)"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        code = request.query_params.get('code')
        
        if not code:
            return Response(
                {'error': 'Code parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            referral_code = ReferralCode.objects.get(code=code, is_active=True)
            
            if referral_code.is_available():
                # Set referral cookie (in production, this should be signed)
                response = Response({
                    'valid': True,
                    'message': 'Referral code tracked'
                })
                response.set_cookie(
                    'referral_code', 
                    code, 
                    max_age=30*24*60*60,  # 30 days
                    httponly=False,
                    samesite='Lax'
                )
                return response
            else:
                return Response({
                    'valid': False,
                    'message': 'Referral code is no longer available'
                })
        except ReferralCode.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid referral code'
            })


class MarketerRequestView(APIView):
    """Create marketer registration request"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Check if user already has a request
        if MarketerRegistrationRequest.objects.filter(user=request.user).exists():
            return Response(
                {'error': 'You already have a pending request'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = request.data.copy()
        data['user'] = request.user.id
        data['email'] = request.user.email
        
        serializer = MarketerRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyMarketerRequestView(APIView):
    """Get current user's marketer request status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            request_obj = MarketerRegistrationRequest.objects.get(user=request.user)
            serializer = MarketerRequestSerializer(request_obj)
            return Response(serializer.data)
        except MarketerRegistrationRequest.DoesNotExist:
            return Response(
                {'error': 'No marketer request found'}, 
                status=status.HTTP_200_OK
            )


class MarketerCodesView(APIView):
    """List and create referral codes for marketers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff_member:
            return Response(
                {'error': 'Access denied. Marketer privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        codes = ReferralCode.objects.filter(marketer=request.user)
        serializer = ReferralCodeSerializer(codes, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_staff_member:
            return Response(
                {'error': 'Access denied. Marketer privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['marketer'] = request.user.id
        
        serializer = ReferralCodeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MarketerCodeDetailView(APIView):
    """Update and delete individual referral codes for marketers"""
    permission_classes = [IsAuthenticated]
    
    def get_object(self, code_id, user):
        try:
            return ReferralCode.objects.get(id=code_id, marketer=user)
        except ReferralCode.DoesNotExist:
            return None
    
    def put(self, request, code_id):
        if not request.user.is_staff_member:
            return Response(
                {'error': 'Access denied. Marketer privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        referral_code = self.get_object(code_id, request.user)
        if not referral_code:
            return Response(
                {'error': 'Referral code not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ReferralCodeSerializer(referral_code, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, code_id):
        if not request.user.is_staff_member:
            return Response(
                {'error': 'Access denied. Marketer privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        referral_code = self.get_object(code_id, request.user)
        if not referral_code:
            return Response(
                {'error': 'Referral code not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        referral_code.delete()
        return Response({'message': 'Referral code deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class MarketerCommissionsView(APIView):
    """Get marketer commissions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff_member:
            return Response(
                {'error': 'Access denied. Marketer privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        commissions = MarketerCommission.objects.filter(marketer=request.user)
        
        # Calculate totals
        total_commissions = sum(c.amount for c in commissions)
        pending_commissions = sum(c.amount for c in commissions.filter(status='pending'))
        paid_commissions = sum(c.amount for c in commissions.filter(status='paid'))
        
        serializer = MarketerCommissionSerializer(commissions, many=True)
        return Response({
            'commissions': serializer.data,
            'totals': {
                'total': float(total_commissions),
                'pending': float(pending_commissions),
                'paid': float(paid_commissions)
            }
        })


class CheckoutView(APIView):
    """Process checkout and create purchase"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                purchases = []
                
                for item in cart.items.all():
                    if item.course:
                        purchase = Purchase.objects.create(
                            user=request.user,
                            purchase_type='course',
                            course=item.course,
                            amount=item.course.get_effective_price(),
                            payment_status='completed'  # For now, auto-complete
                        )
                    else:
                        purchase = Purchase.objects.create(
                            user=request.user,
                            purchase_type='section',
                            section=item.section,
                            amount=item.section.price or 0,
                            payment_status='completed'  # For now, auto-complete
                        )
                    
                    # Apply referral discount if present
                    if cart.referral_code:
                        purchase.apply_referral_discount(cart.referral_code)
                        purchase.save()
                        
                        # Create referral usage and commission
                        referral_usage = ReferralUsage.objects.create(
                            referral_code=cart.referral_code,
                            customer=request.user,
                            purchase=purchase,
                            discount_amount=purchase.discount_amount,
                            commission_amount=purchase.amount * (cart.referral_code.commission_percentage / 100)
                        )
                        
                        # Create marketer commission
                        MarketerCommission.objects.create(
                            marketer=cart.referral_code.marketer,
                            referral_usage=referral_usage,
                            amount=referral_usage.commission_amount
                        )
                        
                        # Increment referral code usage
                        cart.referral_code.increment_usage()
                    
                    purchases.append(purchase)
                
                # Clear cart
                cart.items.all().delete()
                cart.referral_code = None
                cart.save()
                
                serializer = PurchaseSerializer(purchases, many=True)
                return Response({
                    'message': 'Purchase completed successfully',
                    'purchases': serializer.data
                })
                
        except Exception as e:
            return Response(
                {'error': f'Checkout failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserPurchasesView(APIView):
    """Get user's purchase history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        purchases = Purchase.objects.filter(user=request.user).select_related(
            'course', 'section', 'referral_code'
        ).order_by('-created_at')
        
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)
