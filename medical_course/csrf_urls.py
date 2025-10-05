from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

def csrf_view(request):
    """Return CSRF token for React frontend"""
    return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE')})

urlpatterns = [
    path('', ensure_csrf_cookie(csrf_view), name='csrf'),
]
