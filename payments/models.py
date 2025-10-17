from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from courses.models import Course, Section
import uuid
import string
import random

User = get_user_model()

class Purchase(models.Model):
    PURCHASE_TYPE_CHOICES = [
        ('course', 'کل دوره'),
        ('section', 'فصل دوره'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'در انتظار پرداخت'),
        ('completed', 'پرداخت شده'),
        ('failed', 'ناموفق'),
        ('refunded', 'بازگردانده شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    purchase_type = models.CharField(max_length=10, choices=PURCHASE_TYPE_CHOICES)
    
    # Either course or section will be filled, not both
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True, related_name='purchases')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=True, null=True, related_name='purchases')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Payment gateway details
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default='stripe')
    
    # Referral information
    referral_code = models.ForeignKey('ReferralCode', on_delete=models.SET_NULL, blank=True, null=True, related_name='purchases')
    original_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text="مبلغ اصلی قبل از تخفیف")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="مبلغ تخفیف")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "خرید"
        verbose_name_plural = "خریدها"
        ordering = ['-created_at']
    
    def __str__(self):
        item = self.course.title if self.course else self.section.title
        return f"{self.user.username} - {item} ({self.get_payment_status_display()})"
    
    def get_purchased_item(self):
        return self.course if self.course else self.section
    
    def apply_referral_discount(self, referral_code):
        """Apply referral discount to the purchase"""
        if not referral_code or not referral_code.is_available():
            return False
        
        # Calculate original amount if not set
        if not self.original_amount:
            if self.course:
                self.original_amount = self.course.get_effective_price()
            elif self.section:
                self.original_amount = self.section.price or 0
        
        # Calculate discount
        discount_amount = (self.original_amount * referral_code.discount_percentage) / 100
        self.discount_amount = discount_amount
        self.amount = self.original_amount - discount_amount
        self.referral_code = referral_code
        
        return True

class Enrollment(models.Model):
    """Track user enrollments in courses/sections"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True, related_name='enrollments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=True, null=True, related_name='enrollments')
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='enrollments')
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "ثبت‌نام"
        verbose_name_plural = "ثبت‌نام‌ها"
        unique_together = [
            ['user', 'course'],
            ['user', 'section'],
        ]
    
    def __str__(self):
        item = self.course.title if self.course else self.section.title
        return f"{self.user.username} enrolled in {item}"

class VideoProgress(models.Model):
    """Track user progress for videos"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey('courses.Video', on_delete=models.CASCADE)
    watched_seconds = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    last_watched_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "پیشرفت ویدیو"
        verbose_name_plural = "پیشرفت ویدیوها"
        unique_together = ['user', 'video']
    
    def __str__(self):
        return f"{self.user.username} - {self.video.title}"
    
    def get_progress_percentage(self):
        if not self.video.duration_seconds:
            return 0
        return min(100, (self.watched_seconds / self.video.duration_seconds) * 100)

class Cart(models.Model):
    """Shopping cart for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    referral_code = models.ForeignKey('ReferralCode', on_delete=models.SET_NULL, blank=True, null=True, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"
    
    def __str__(self):
        return f"{self.user.username}'s Cart"
    
    def get_subtotal(self):
        """Get subtotal before any discounts"""
        total = 0
        for item in self.items.all():
            if item.course:
                total += item.course.get_effective_price()
            elif item.section:
                total += item.section.price or 0
        return total
    
    def get_total_amount(self):
        """Get total amount after applying referral discount"""
        subtotal = self.get_subtotal()
        if self.referral_code and self.referral_code.is_available():
            discount_amount = (subtotal * self.referral_code.discount_percentage) / 100
            return subtotal - discount_amount
        return subtotal
    
    def get_discount_amount(self):
        """Get discount amount from referral code"""
        if self.referral_code and self.referral_code.is_available():
            subtotal = self.get_subtotal()
            return (subtotal * self.referral_code.discount_percentage) / 100
        return 0
    
    def get_total_items(self):
        return self.items.count()
    
    def apply_referral_code(self, code):
        """Apply a referral code to the cart"""
        try:
            referral_code = ReferralCode.objects.get(code=code, is_active=True)
            if referral_code.is_available():
                self.referral_code = referral_code
                self.save()
                return True, "کد معرفی با موفقیت اعمال شد"
            else:
                return False, "کد معرفی قابل استفاده نیست"
        except ReferralCode.DoesNotExist:
            return False, "کد معرفی یافت نشد"
    
    def remove_referral_code(self):
        """Remove referral code from cart"""
        self.referral_code = None
        self.save()

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "آیتم سبد خرید"
        verbose_name_plural = "آیتم‌های سبد خرید"
        unique_together = [
            ['cart', 'course'],
            ['cart', 'section'],
        ]
    
    def __str__(self):
        item = self.course.title if self.course else self.section.title
        return f"{self.cart.user.username} - {item}"
    
    def get_item_price(self):
        if self.course:
            return self.course.get_effective_price()
        elif self.section:
            return self.section.price or 0
        return 0

class ReferralCode(models.Model):
    """Referral codes for marketers to provide discounts and earn commissions"""
    marketer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_codes', limit_choices_to={'user_type': 'staff'})
    code = models.CharField(max_length=20, unique=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="درصد تخفیف برای مشتری")
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, help_text="درصد کمیسیون برای بازاریاب")
    is_active = models.BooleanField(default=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text="حداکثر تعداد استفاده (خالی = نامحدود)")
    current_uses = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "کد معرف"
        verbose_name_plural = "کدهای معرف"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.marketer.username}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_unique_code()
        super().save(*args, **kwargs)
    
    def generate_unique_code(self):
        """Generate a unique referral code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not ReferralCode.objects.filter(code=code).exists():
                return code
    
    def is_available(self):
        """Check if the referral code can still be used"""
        if not self.is_active:
            return False
        if self.max_uses and self.current_uses >= self.max_uses:
            return False
        return True
    
    def increment_usage(self):
        """Increment the usage count"""
        self.current_uses += 1
        self.save(update_fields=['current_uses'])

class ReferralUsage(models.Model):
    """Track when referral codes are used"""
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE, related_name='usages')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_usages')
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name='referral_usage')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "استفاده از کد معرف"
        verbose_name_plural = "استفاده‌های کد معرف"
        ordering = ['-created_at']
        unique_together = ['referral_code', 'purchase']
    
    def __str__(self):
        return f"{self.referral_code.code} used by {self.customer.username}"

class MarketerCommission(models.Model):
    """Track marketer commissions"""
    marketer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commissions', limit_choices_to={'user_type': 'staff'})
    referral_usage = models.ForeignKey(ReferralUsage, on_delete=models.CASCADE, related_name='commission')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'در انتظار'),
        ('paid', 'پرداخت شده'),
        ('cancelled', 'لغو شده'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "کمیسیون بازاریاب"
        verbose_name_plural = "کمیسیون‌های بازاریاب"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.marketer.username} - {self.amount} ({self.get_status_display()})"

class MarketerRegistrationRequest(models.Model):
    """Store requests from users to join the marketers club"""
    
    STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('beginner', 'مبتدی'),
        ('intermediate', 'متوسط'),
        ('advanced', 'پیشرفته'),
        ('expert', 'متخصص'),
    ]
    
    INTEREST_CHOICES = [
        ('medical', 'دوره‌های پزشکی و سلامت'),
        ('technology', 'دوره‌های تکنولوژی'),
        ('business', 'دوره‌های کسب و کار'),
        ('education', 'دوره‌های آموزشی'),
        ('all', 'همه موضوعات'),
    ]
    
    # User information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketer_requests')
    
    # Personal Information
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    
    # Professional Information
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    current_job = models.CharField(max_length=100, blank=True, null=True)
    
    # Interest and Motivation
    interest_area = models.CharField(max_length=20, choices=INTEREST_CHOICES)
    motivation = models.TextField()
    marketing_experience = models.TextField(blank=True, null=True)
    
    # Social Media
    instagram_handle = models.CharField(max_length=100, blank=True, null=True)
    telegram_handle = models.CharField(max_length=100, blank=True, null=True)
    
    # Status and Admin
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True, help_text="یادداشت‌های ادمین")
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='reviewed_requests')
    reviewed_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "درخواست عضویت بازاریاب"
        verbose_name_plural = "درخواست‌های عضویت بازاریاب"
        ordering = ['-created_at']
        unique_together = ['user']  # One request per user
    
    def __str__(self):
        return f"{self.full_name} - {self.get_status_display()}"
    
    def approve(self, admin_user):
        """Approve the request and convert user to staff"""
        self.status = 'approved'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save()
        
        # Convert user to staff
        self.user.user_type = 'staff'
        self.user.save()
    
    def reject(self, admin_user, notes=None):
        """Reject the request"""
        self.status = 'rejected'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        if notes:
            self.admin_notes = notes
        self.save()


class ReferralCodeSettings(models.Model):
    """Singleton model for default referral code settings"""
    
    default_discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        help_text="درصد تخفیف پیش‌فرض برای کدهای معرفی جدید"
    )
    default_commission_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        help_text="درصد کمیسیون پیش‌فرض برای کدهای معرفی جدید"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "تنظیمات کدهای معرفی"
        verbose_name_plural = "تنظیمات کدهای معرفی"
    
    def __str__(self):
        return f"تنظیمات کدهای معرفی (تخفیف: {self.default_discount_percentage}%, کمیسیون: {self.default_commission_percentage}%)"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        if not self.pk and ReferralCodeSettings.objects.exists():
            raise ValueError("تنظیمات کدهای معرفی قبلاً ایجاد شده است. فقط یک نمونه مجاز است.")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get the singleton settings instance, create if doesn't exist"""
        settings, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'default_discount_percentage': 10.00,
                'default_commission_percentage': 10.00
            }
        )
        return settings
