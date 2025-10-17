from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import SupportTicket, TicketMessage
from .serializers import (
    SupportTicketSerializer, SupportTicketListSerializer, 
    TicketMessageSerializer, CreateTicketMessageSerializer
)


class SupportTicketListView(APIView):
    """List support tickets for admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if not request.user.is_admin_user:
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tickets = SupportTicket.objects.select_related('user', 'assigned_to').prefetch_related('messages')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tickets = tickets.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            tickets = tickets.filter(priority=priority_filter)
        
        # Filter by category
        category_filter = request.query_params.get('category')
        if category_filter:
            tickets = tickets.filter(category=category_filter)
        
        # Search
        search = request.query_params.get('search')
        if search:
            tickets = tickets.filter(
                Q(subject__icontains=search) | 
                Q(description__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        serializer = SupportTicketListSerializer(tickets, many=True)
        return Response(serializer.data)


class SupportTicketDetailView(APIView):
    """Get ticket detail for admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ticket_id):
        # Check if user is admin
        if not request.user.is_admin_user:
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data)
    
    def put(self, request, ticket_id):
        # Check if user is admin
        if not request.user.is_admin_user:
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        serializer = SupportTicketSerializer(ticket, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Handle status changes
            if 'status' in request.data:
                new_status = request.data['status']
                if new_status == 'closed' and ticket.status != 'closed':
                    ticket.close_ticket()
                elif new_status == 'open' and ticket.status == 'closed':
                    ticket.reopen_ticket()
                else:
                    ticket.status = new_status
                    ticket.save()
            
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketMessageCreateView(APIView):
    """Create a message in a ticket"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, ticket_id):
        # Check if user is admin
        if not request.user.is_admin_user:
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        ticket = get_object_or_404(SupportTicket, id=ticket_id)
        
        serializer = CreateTicketMessageSerializer(
            data=request.data, 
            context={'request': request, 'ticket': ticket}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            
            # Update ticket status to in_progress if it was open
            if ticket.status == 'open':
                ticket.status = 'in_progress'
                ticket.assigned_to = request.user
                ticket.save()
            
            return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserTicketsView(APIView):
    """Get user's own tickets"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
        serializer = SupportTicketListSerializer(tickets, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new ticket"""
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = SupportTicketSerializer(data=data)
        if serializer.is_valid():
            ticket = serializer.save()
            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserTicketDetailView(APIView):
    """Get user's ticket detail"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, ticket_id):
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=request.user)
        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data)
    
    def post(self, request, ticket_id):
        """Add message to user's ticket"""
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=request.user)
        
        serializer = CreateTicketMessageSerializer(
            data=request.data, 
            context={'request': request, 'ticket': ticket}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
