from django.urls import path
from . import api_views

app_name = 'tickets'

urlpatterns = [
    # Admin endpoints
    path('admin/tickets/', api_views.SupportTicketListView.as_view(), name='admin_ticket_list'),
    path('admin/tickets/<int:ticket_id>/', api_views.SupportTicketDetailView.as_view(), name='admin_ticket_detail'),
    path('admin/tickets/<int:ticket_id>/reply/', api_views.TicketMessageCreateView.as_view(), name='admin_ticket_reply'),
    
    # User endpoints
    path('tickets/', api_views.UserTicketsView.as_view(), name='user_tickets'),
    path('tickets/<int:ticket_id>/', api_views.UserTicketDetailView.as_view(), name='user_ticket_detail'),
]
