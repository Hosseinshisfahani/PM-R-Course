from rest_framework import serializers
from .models import SupportTicket, TicketMessage
from accounts.serializers import UserSerializer


class TicketMessageSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_from_admin = serializers.BooleanField(read_only=True)
    is_from_customer = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TicketMessage
        fields = ['id', 'author', 'message', 'is_internal', 'created_at', 'is_from_admin', 'is_from_customer']
        read_only_fields = ['author', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    last_activity = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'subject', 'description', 'status', 'priority', 
            'category', 'assigned_to', 'created_at', 'updated_at', 'closed_at',
            'messages', 'last_activity'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'closed_at']


class SupportTicketListSerializer(serializers.ModelSerializer):
    """Simplified serializer for ticket lists"""
    user = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    last_activity = serializers.DateTimeField(read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'subject', 'status', 'priority', 'category',
            'assigned_to', 'created_at', 'updated_at', 'last_activity', 'message_count'
        ]
    
    def get_message_count(self, obj):
        return obj.messages.count()


class CreateTicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ['message', 'is_internal']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['ticket'] = self.context['ticket']
        return super().create(validated_data)
