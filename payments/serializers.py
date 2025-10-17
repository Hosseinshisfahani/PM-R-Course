from rest_framework import serializers
from .models import (
    Cart, CartItem, ReferralCode, MarketerRegistrationRequest,
    MarketerCommission, Purchase, ReferralUsage, ReferralCodeSettings
)
from courses.models import Course, Section
from courses.serializers import CourseListSerializer
from accounts.models import User


class CartItemSerializer(serializers.ModelSerializer):
    """Cart item serializer"""
    course = CourseListSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False)
    section_id = serializers.IntegerField(write_only=True, required=False)
    item_title = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'course', 'course_id', 'section_id', 'item_title', 
            'item_price', 'added_at'
        ]
        read_only_fields = ['id', 'added_at']
    
    def get_item_title(self, obj):
        if obj.course:
            return obj.course.title
        elif obj.section:
            return obj.section.title
        return ""
    
    def get_item_price(self, obj):
        return obj.get_item_price()


class CartSerializer(serializers.ModelSerializer):
    """Cart serializer"""
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    referral_discount = serializers.SerializerMethodField()  # Add referral_discount field for frontend compatibility
    total_amount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()  # Add total field for frontend compatibility
    total_items = serializers.SerializerMethodField()
    referral_code = serializers.CharField(source='referral_code.code', read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id', 'items', 'subtotal', 'discount_amount', 'referral_discount', 'total_amount', 'total',
            'total_items', 'referral_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()
    
    def get_discount_amount(self, obj):
        return obj.get_discount_amount()
    
    def get_referral_discount(self, obj):
        """Return referral discount amount for frontend compatibility"""
        return obj.get_discount_amount()
    
    def get_total_amount(self, obj):
        return obj.get_total_amount()
    
    def get_total(self, obj):
        """Return total amount for frontend compatibility"""
        return obj.get_total_amount()
    
    def get_total_items(self, obj):
        return obj.get_total_items()


class ReferralCodeSerializer(serializers.ModelSerializer):
    """Referral code serializer"""
    marketer_name = serializers.CharField(source='marketer.get_full_name', read_only=True)
    
    class Meta:
        model = ReferralCode
        fields = [
            'id', 'code', 'discount_percentage', 'commission_percentage',
            'is_active', 'max_uses', 'current_uses', 'marketer', 'marketer_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_uses', 'created_at', 'updated_at']


class MarketerRequestSerializer(serializers.ModelSerializer):
    """Marketer registration request serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    experience_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    interest_display = serializers.CharField(source='get_interest_area_display', read_only=True)
    
    class Meta:
        model = MarketerRegistrationRequest
        fields = [
            'id', 'user', 'user_name', 'full_name', 'phone_number', 'email',
            'experience_level', 'experience_display', 'current_job',
            'interest_area', 'interest_display', 'motivation',
            'marketing_experience', 'instagram_handle', 'telegram_handle',
            'status', 'status_display', 'admin_notes', 'reviewed_by',
            'reviewed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_name', 'status', 'admin_notes', 'reviewed_by',
            'reviewed_at', 'created_at', 'updated_at'
        ]


class MarketerCommissionSerializer(serializers.ModelSerializer):
    """Marketer commission serializer"""
    referral_code = serializers.CharField(source='referral_usage.referral_code.code', read_only=True)
    customer_name = serializers.CharField(source='referral_usage.customer.get_full_name', read_only=True)
    purchase_amount = serializers.DecimalField(source='referral_usage.purchase.amount', max_digits=10, decimal_places=2, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MarketerCommission
        fields = [
            'id', 'referral_code', 'customer_name', 'purchase_amount',
            'amount', 'status', 'status_display', 'created_at', 'paid_at'
        ]
        read_only_fields = ['id', 'created_at', 'paid_at']


class MarketerSerializer(serializers.ModelSerializer):
    """Marketer serializer for admin panel"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    referral_codes_count = serializers.SerializerMethodField()
    active_codes_count = serializers.SerializerMethodField()
    total_commissions = serializers.SerializerMethodField()
    pending_commissions = serializers.SerializerMethodField()
    join_date = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'referral_codes_count', 'active_codes_count', 'total_commissions',
            'pending_commissions', 'join_date', 'is_active'
        ]
        read_only_fields = ['id', 'join_date']
    
    def get_referral_codes_count(self, obj):
        return ReferralCode.objects.filter(marketer=obj).count()
    
    def get_active_codes_count(self, obj):
        return ReferralCode.objects.filter(marketer=obj, is_active=True).count()
    
    def get_total_commissions(self, obj):
        from django.db.models import Sum
        result = MarketerCommission.objects.filter(marketer=obj).aggregate(
            total=Sum('amount')
        )
        return result['total'] or 0
    
    def get_pending_commissions(self, obj):
        from django.db.models import Sum
        result = MarketerCommission.objects.filter(
            marketer=obj, 
            status='pending'
        ).aggregate(total=Sum('amount'))
        return result['total'] or 0


class ReferralCodeSettingsSerializer(serializers.ModelSerializer):
    """Serializer for referral code settings"""
    
    class Meta:
        model = ReferralCodeSettings
        fields = [
            'id', 'default_discount_percentage', 'default_commission_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PurchaseSerializer(serializers.ModelSerializer):
    """Purchase serializer"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'purchase_type', 'course_title', 'section_title',
            'amount', 'original_amount', 'discount_amount', 'payment_status',
            'payment_status_display', 'transaction_id', 'payment_method',
            'referral_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
