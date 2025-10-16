from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class SupportTicket(models.Model):
    """Support ticket model for customer service"""
    
    STATUS_CHOICES = [
        ('open', 'باز'),
        ('in_progress', 'در حال بررسی'),
        ('closed', 'بسته شده'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'بالا'),
        ('urgent', 'فوری'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'مشکل فنی'),
        ('billing', 'مسائل مالی'),
        ('course_access', 'دسترسی به دوره'),
        ('account', 'حساب کاربری'),
        ('general', 'عمومی'),
        ('other', 'سایر'),
    ]
    
    # Basic Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200, verbose_name="موضوع")
    description = models.TextField(verbose_name="توضیحات")
    
    # Ticket Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', verbose_name="وضعیت")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="اولویت")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general', verbose_name="دسته‌بندی")
    
    # Admin Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='assigned_tickets', limit_choices_to={'user_type': 'admin'})
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین به‌روزرسانی")
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name="تاریخ بسته شدن")
    
    class Meta:
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"#{self.id} - {self.subject} ({self.get_status_display()})"
    
    def close_ticket(self):
        """Close the ticket"""
        self.status = 'closed'
        self.closed_at = timezone.now()
        self.save()
    
    def reopen_ticket(self):
        """Reopen the ticket"""
        self.status = 'open'
        self.closed_at = None
        self.save()
    
    def get_last_activity(self):
        """Get the last activity time"""
        last_message = self.messages.last()
        if last_message:
            return last_message.created_at
        return self.created_at


class TicketMessage(models.Model):
    """Messages within a support ticket"""
    
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    message = models.TextField(verbose_name="پیام")
    is_internal = models.BooleanField(default=False, verbose_name="پیام داخلی", 
                                     help_text="آیا این پیام فقط برای ادمین‌ها قابل مشاهده است؟")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ارسال")
    
    class Meta:
        verbose_name = "پیام تیکت"
        verbose_name_plural = "پیام‌های تیکت"
        ordering = ['created_at']
    
    def __str__(self):
        return f"پیام از {self.author.username} در تیکت #{self.ticket.id}"
    
    def is_from_admin(self):
        """Check if message is from admin"""
        return self.author.user_type == 'admin'
    
    def is_from_customer(self):
        """Check if message is from customer"""
        return self.author.user_type == 'customer'
