from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """User serializer for API responses"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'username',
            'user_type', 'phone_number', 'birth_date', 'profile_image',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add computed fields
        data['is_staff_member'] = instance.is_staff_member()
        data['is_admin_user'] = instance.is_admin_user()
        data['is_customer'] = instance.is_customer()
        return data
