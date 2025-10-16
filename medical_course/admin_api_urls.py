from django.urls import path
from . import admin_api_views

app_name = 'admin_api'

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', admin_api_views.AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    
    # Users
    path('users/', admin_api_views.AdminUsersView.as_view(), name='admin_users'),
    path('users/<int:user_id>/', admin_api_views.AdminUsersView.as_view(), name='admin_user_detail'),
    
    # Marketer Requests
    path('marketer-requests/', admin_api_views.AdminMarketerRequestsView.as_view(), name='admin_marketer_requests'),
    path('marketer-requests/<int:request_id>/', admin_api_views.AdminMarketerRequestsView.as_view(), name='admin_marketer_request_action'),
    
    # Financial
    path('purchases/', admin_api_views.AdminPurchasesView.as_view(), name='admin_purchases'),
    path('commissions/', admin_api_views.AdminCommissionsView.as_view(), name='admin_commissions'),
    path('commissions/<int:commission_id>/mark-paid/', admin_api_views.AdminCommissionsView.as_view(), name='admin_commission_mark_paid'),
    
    # Courses
    path('courses/', admin_api_views.AdminCoursesView.as_view(), name='admin_courses'),
    path('courses/<int:course_id>/', admin_api_views.AdminCoursesView.as_view(), name='admin_course_detail'),
    
    # Packages
    path('packages/', admin_api_views.AdminPackagesView.as_view(), name='admin_packages'),
    path('packages/<int:package_id>/', admin_api_views.AdminPackagesView.as_view(), name='admin_package_detail'),
    
    # Tickets
    path('tickets/', admin_api_views.AdminTicketsView.as_view(), name='admin_tickets'),
    path('tickets/<int:ticket_id>/', admin_api_views.AdminTicketsView.as_view(), name='admin_ticket_detail'),
    path('tickets/<int:ticket_id>/reply/', admin_api_views.AdminTicketReplyView.as_view(), name='admin_ticket_reply'),
]
