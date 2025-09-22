from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('اطلاعات اضافی', {
            'fields': ('user_type', 'phone_number', 'birth_date', 'profile_image')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('اطلاعات اضافی', {
            'fields': ('user_type', 'phone_number', 'birth_date', 'profile_image')
        }),
    )
