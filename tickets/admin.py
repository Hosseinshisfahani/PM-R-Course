from django.contrib import admin
from .models import SupportTicket, TicketMessage


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'subject', 'user', 'status', 'priority', 'category', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'category', 'created_at']
    search_fields = ['subject', 'description', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'closed_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('user', 'subject', 'description')
        }),
        ('جزئیات تیکت', {
            'fields': ('status', 'priority', 'category', 'assigned_to')
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at', 'closed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['message', 'author__username', 'ticket__subject']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
