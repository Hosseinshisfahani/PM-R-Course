from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .permissions import IsAdminUser
from accounts.models import User
from accounts.serializers import UserSerializer
from payments.models import Purchase, MarketerCommission, MarketerRegistrationRequest, ReferralCode, ReferralCodeSettings
from payments.serializers import PurchaseSerializer, MarketerCommissionSerializer, MarketerSerializer, ReferralCodeSerializer, ReferralCodeSettingsSerializer
from courses.models import Course, CoursePackage
from courses.serializers import CourseListSerializer, CourseDetailSerializer, CoursePackageSerializer
from tickets.models import SupportTicket, TicketMessage
from tickets.serializers import SupportTicketSerializer, SupportTicketListSerializer, TicketMessageSerializer, CreateTicketMessageSerializer


class AdminDashboardStatsView(APIView):
    """Get dashboard statistics for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # Calculate date ranges
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        
        # User statistics
        total_users = User.objects.count()
        new_users_this_month = User.objects.filter(created_at__gte=this_month_start).count()
        admin_users = User.objects.filter(user_type='admin').count()
        marketer_users = User.objects.filter(user_type='staff').count()
        customer_users = User.objects.filter(user_type='customer').count()
        
        # Course statistics
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(is_published=True).count()
        total_packages = CoursePackage.objects.count()
        published_packages = CoursePackage.objects.filter(is_published=True).count()
        
        # Financial statistics
        total_revenue = Purchase.objects.filter(payment_status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        this_month_revenue = Purchase.objects.filter(
            payment_status='completed',
            created_at__gte=this_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        pending_commissions = MarketerCommission.objects.filter(status='pending').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Ticket statistics
        total_tickets = SupportTicket.objects.count()
        open_tickets = SupportTicket.objects.filter(status='open').count()
        in_progress_tickets = SupportTicket.objects.filter(status='in_progress').count()
        closed_tickets = SupportTicket.objects.filter(status='closed').count()
        
        # Recent activity
        recent_purchases = Purchase.objects.filter(
            payment_status='completed'
        ).order_by('-created_at')[:5]
        
        recent_tickets = SupportTicket.objects.order_by('-created_at')[:5]
        
        # Historical data for charts (last 6 months)
        monthly_data = []
        for i in range(6):
            month_start = (this_month_start - timedelta(days=30*i)).replace(day=1)
            if i == 0:
                month_end = now
            else:
                month_end = (this_month_start - timedelta(days=30*(i-1))).replace(day=1)
            
            # Monthly revenue
            monthly_revenue = Purchase.objects.filter(
                payment_status='completed',
                created_at__gte=month_start,
                created_at__lt=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Monthly user growth
            monthly_users = User.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
            
            # Month name in Persian
            month_names = ['شهریور', 'مرداد', 'تیر', 'خرداد', 'اردیبهشت', 'فروردین']
            month_name = month_names[i]
            
            monthly_data.append({
                'month': month_name,
                'revenue': float(monthly_revenue),
                'users': monthly_users
            })
        
        return Response({
            'users': {
                'total': total_users,
                'new_this_month': new_users_this_month,
                'by_type': {
                    'admin': admin_users,
                    'marketer': marketer_users,
                    'customer': customer_users
                }
            },
            'courses': {
                'total': total_courses,
                'published': published_courses,
                'packages_total': total_packages,
                'packages_published': published_packages
            },
            'financial': {
                'total_revenue': float(total_revenue),
                'this_month_revenue': float(this_month_revenue),
                'pending_commissions': float(pending_commissions)
            },
            'tickets': {
                'total': total_tickets,
                'open': open_tickets,
                'in_progress': in_progress_tickets,
                'closed': closed_tickets
            },
            'recent_activity': {
                'purchases': PurchaseSerializer(recent_purchases, many=True).data,
                'tickets': SupportTicketSerializer(recent_tickets, many=True).data
            },
            'monthly_data': monthly_data
        })


class AdminUsersView(APIView):
    """Manage users for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        
        # Filter by user type
        user_type = request.query_params.get('user_type')
        if user_type:
            users = users.filter(user_type=user_type)
        
        # Search
        search = request.query_params.get('search')
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        
        # Update user fields
        if 'user_type' in request.data:
            user.user_type = request.data['user_type']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)


class AdminMarketerRequestsView(APIView):
    """Manage marketer registration requests"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        requests = MarketerRegistrationRequest.objects.select_related('user').order_by('-created_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            requests = requests.filter(status=status_filter)
        
        from payments.serializers import MarketerRequestSerializer
        serializer = MarketerRequestSerializer(requests, many=True)
        return Response(serializer.data)
    
    def post(self, request, request_id):
        """Approve or reject marketer request"""
        marketer_request = get_object_or_404(MarketerRegistrationRequest, id=request_id)
        action = request.data.get('action')
        admin_notes = request.data.get('admin_notes', '')
        
        if action == 'approve':
            marketer_request.approve(request.user)
            return Response({'message': 'Marketer request approved successfully'})
        elif action == 'reject':
            marketer_request.reject(request.user, admin_notes)
            return Response({'message': 'Marketer request rejected'})
        else:
            return Response(
                {'error': 'Invalid action. Use "approve" or "reject".'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminPurchasesView(APIView):
    """View all purchases for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        purchases = Purchase.objects.select_related('user', 'course', 'section').order_by('-created_at')
        
        # Filter by payment status
        status_filter = request.query_params.get('status')
        if status_filter:
            purchases = purchases.filter(payment_status=status_filter)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            purchases = purchases.filter(created_at__gte=start_date)
        if end_date:
            purchases = purchases.filter(created_at__lte=end_date)
        
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)


class AdminCommissionsView(APIView):
    """Manage marketer commissions"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        commissions = MarketerCommission.objects.select_related(
            'marketer', 'referral_usage__referral_code'
        ).order_by('-created_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            commissions = commissions.filter(status=status_filter)
        
        serializer = MarketerCommissionSerializer(commissions, many=True)
        return Response(serializer.data)
    
    def post(self, request, commission_id):
        """Mark commission as paid"""
        commission = get_object_or_404(MarketerCommission, id=commission_id)
        commission.status = 'paid'
        commission.paid_at = timezone.now()
        commission.save()
        
        serializer = MarketerCommissionSerializer(commission)
        return Response(serializer.data)


class AdminCoursesView(APIView):
    """Manage courses for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        courses = Course.objects.select_related('category', 'instructor').order_by('-created_at')
        
        # Filter by published status
        is_published = request.query_params.get('is_published')
        if is_published is not None:
            courses = courses.filter(is_published=is_published.lower() == 'true')
        
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new course"""
        serializer = CourseDetailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, course_id):
        """Update course"""
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseDetailSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, course_id):
        """Delete course"""
        course = get_object_or_404(Course, id=course_id)
        course.delete()
        return Response({'message': 'Course deleted successfully'})


class AdminMarketersView(APIView):
    """Manage active marketers for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get all active marketers with their stats"""
        marketers = User.objects.filter(user_type='staff').order_by('-created_at')
        
        # Filter by search term
        search = request.query_params.get('search')
        if search:
            marketers = marketers.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        serializer = MarketerSerializer(marketers, many=True)
        return Response(serializer.data)


class AdminReferralCodesView(APIView):
    """Manage referral codes for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get all referral codes with usage stats"""
        codes = ReferralCode.objects.select_related('marketer').order_by('-created_at')
        
        # Filter by status
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            codes = codes.filter(is_active=is_active.lower() == 'true')
        
        # Filter by marketer
        marketer_id = request.query_params.get('marketer_id')
        if marketer_id:
            codes = codes.filter(marketer_id=marketer_id)
        
        serializer = ReferralCodeSerializer(codes, many=True)
        return Response(serializer.data)
    
    def put(self, request, code_id):
        """Update referral code"""
        code = get_object_or_404(ReferralCode, id=code_id)
        serializer = ReferralCodeSerializer(code, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, code_id):
        """Delete referral code"""
        code = get_object_or_404(ReferralCode, id=code_id)
        code.delete()
        return Response({'message': 'Referral code deleted successfully'})


class AdminReferralCodeSettingsView(APIView):
    """Manage referral code default settings"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get current default settings"""
        settings = ReferralCodeSettings.get_settings()
        serializer = ReferralCodeSettingsSerializer(settings)
        return Response(serializer.data)
    
    def put(self, request):
        """Update default settings"""
        settings = ReferralCodeSettings.get_settings()
        serializer = ReferralCodeSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPackagesView(APIView):
    """Manage course packages for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        packages = CoursePackage.objects.prefetch_related('courses').order_by('-created_at')
        
        # Filter by published status
        is_published = request.query_params.get('is_published')
        if is_published is not None:
            packages = packages.filter(is_published=is_published.lower() == 'true')
        
        serializer = CoursePackageSerializer(packages, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new package"""
        serializer = CoursePackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, package_id):
        """Update package"""
        package = get_object_or_404(CoursePackage, id=package_id)
        serializer = CoursePackageSerializer(package, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, package_id):
        """Delete package"""
        package = get_object_or_404(CoursePackage, id=package_id)
        package.delete()
        return Response({'message': 'Package deleted successfully'})


class AdminTicketsView(APIView):
    """Manage support tickets for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, ticket_id=None):
        if ticket_id:
            # Get specific ticket
            ticket = get_object_or_404(SupportTicket, id=ticket_id)
            serializer = SupportTicketSerializer(ticket)
            return Response(serializer.data)
        else:
            # List all tickets
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
    
    def put(self, request, ticket_id):
        """Update ticket"""
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


class AdminTicketReplyView(APIView):
    """Reply to ticket for admin"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, ticket_id):
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
