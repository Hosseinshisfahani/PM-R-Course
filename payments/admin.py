from django.contrib import admin
from .models import Purchase, Enrollment, VideoProgress, Cart, CartItem, ReferralCode, ReferralUsage, MarketerCommission, MarketerRegistrationRequest

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'purchase_type', 'get_purchased_item_title', 'amount', 'payment_status', 'referral_code', 'created_at')
    list_filter = ('purchase_type', 'payment_status', 'payment_method', 'referral_code', 'created_at')
    search_fields = ('user__username', 'transaction_id', 'course__title', 'section__title', 'referral_code__code')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def get_purchased_item_title(self, obj):
        return obj.course.title if obj.course else obj.section.title
    get_purchased_item_title.short_description = 'آیتم خریداری شده'

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_enrolled_item_title', 'purchase', 'enrolled_at')
    list_filter = ('enrolled_at',)
    search_fields = ('user__username', 'course__title', 'section__title')
    ordering = ('-enrolled_at',)
    
    def get_enrolled_item_title(self, obj):
        return obj.course.title if obj.course else obj.section.title
    get_enrolled_item_title.short_description = 'آیتم ثبت‌نام شده'

@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'get_progress_percentage', 'is_completed', 'last_watched_at')
    list_filter = ('is_completed', 'last_watched_at')
    search_fields = ('user__username', 'video__title')
    ordering = ('-last_watched_at',)
    
    def get_progress_percentage(self, obj):
        return f"{obj.get_progress_percentage():.1f}%"
    get_progress_percentage.short_description = 'درصد پیشرفت'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ('course', 'section', 'get_item_price', 'added_at')
    readonly_fields = ('get_item_price', 'added_at')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_total_items', 'get_total_amount', 'updated_at')
    search_fields = ('user__username',)
    ordering = ('-updated_at',)
    inlines = [CartItemInline]
    
    def get_total_items(self, obj):
        return obj.get_total_items()
    get_total_items.short_description = 'تعداد آیتم‌ها'
    
    def get_total_amount(self, obj):
        return f"{obj.get_total_amount():,} تومان"
    get_total_amount.short_description = 'مجموع قیمت'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'get_item_title', 'get_item_price', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('cart__user__username', 'course__title', 'section__title')
    ordering = ('-added_at',)
    
    def get_item_title(self, obj):
        return obj.course.title if obj.course else obj.section.title
    get_item_title.short_description = 'آیتم'

@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'marketer', 'discount_percentage', 'commission_percentage', 'is_active', 'current_uses', 'max_uses', 'created_at')
    list_filter = ('is_active', 'created_at', 'marketer')
    search_fields = ('code', 'marketer__username', 'marketer__email')
    ordering = ('-created_at',)
    readonly_fields = ('code', 'current_uses', 'created_at', 'updated_at')
    
    fieldsets = (
        ('اطلاعات کلی', {
            'fields': ('marketer', 'code', 'is_active')
        }),
        ('تنظیمات تخفیف و کمیسیون', {
            'fields': ('discount_percentage', 'commission_percentage')
        }),
        ('محدودیت استفاده', {
            'fields': ('max_uses', 'current_uses')
        }),
        ('اطلاعات زمانی', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

class ReferralUsageInline(admin.TabularInline):
    model = ReferralUsage
    extra = 0
    readonly_fields = ('customer', 'purchase', 'discount_amount', 'commission_amount', 'created_at')

@admin.register(ReferralUsage)
class ReferralUsageAdmin(admin.ModelAdmin):
    list_display = ('referral_code', 'customer', 'get_purchase_item', 'discount_amount', 'commission_amount', 'created_at')
    list_filter = ('created_at', 'referral_code')
    search_fields = ('referral_code__code', 'customer__username', 'purchase__course__title', 'purchase__section__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    def get_purchase_item(self, obj):
        if obj.purchase.course:
            return obj.purchase.course.title
        elif obj.purchase.section:
            return obj.purchase.section.title
        return 'نامشخص'
    get_purchase_item.short_description = 'آیتم خرید'

@admin.register(MarketerCommission)
class MarketerCommissionAdmin(admin.ModelAdmin):
    list_display = ('marketer', 'amount', 'status', 'created_at', 'paid_at')
    list_filter = ('status', 'created_at', 'paid_at', 'marketer')
    search_fields = ('marketer__username', 'referral_usage__referral_code__code')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('اطلاعات کمیسیون', {
            'fields': ('marketer', 'referral_usage', 'amount', 'status')
        }),
        ('اطلاعات پرداخت', {
            'fields': ('paid_at',)
        }),
        ('اطلاعات زمانی', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # If status is changed to 'paid' and paid_at is not set, set it to now
        if obj.status == 'paid' and not obj.paid_at:
            from django.utils import timezone
            obj.paid_at = timezone.now()
        super().save_model(request, obj, form, change)

@admin.register(MarketerRegistrationRequest)
class MarketerRegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'email', 'phone_number', 'experience_level', 'status', 'created_at')
    list_filter = ('status', 'experience_level', 'interest_area', 'created_at')
    search_fields = ('full_name', 'user__username', 'email', 'phone_number')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('اطلاعات کاربر', {
            'fields': ('user', 'full_name', 'email', 'phone_number')
        }),
        ('اطلاعات حرفه‌ای', {
            'fields': ('experience_level', 'current_job', 'interest_area')
        }),
        ('انگیزه و تجربه', {
            'fields': ('motivation', 'marketing_experience')
        }),
        ('شبکه‌های اجتماعی', {
            'fields': ('instagram_handle', 'telegram_handle')
        }),
        ('وضعیت و بررسی', {
            'fields': ('status', 'admin_notes', 'reviewed_by', 'reviewed_at')
        }),
        ('اطلاعات زمانی', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_requests', 'reject_requests']
    
    def approve_requests(self, request, queryset):
        from django.utils import timezone
        for req in queryset.filter(status='pending'):
            req.approve(request.user)
        self.message_user(request, f'{queryset.count()} درخواست تایید شد.')
    approve_requests.short_description = 'تایید درخواست‌های انتخاب شده'
    
    def reject_requests(self, request, queryset):
        from django.utils import timezone
        for req in queryset.filter(status='pending'):
            req.reject(request.user, 'رد شده توسط ادمین')
        self.message_user(request, f'{queryset.count()} درخواست رد شد.')
    reject_requests.short_description = 'رد درخواست‌های انتخاب شده'
