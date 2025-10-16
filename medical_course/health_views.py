from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json


@csrf_exempt
@require_http_methods(["GET", "POST"])
def health_check(request):
    """Health check endpoint for frontend connectivity testing"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Django backend is running',
        'timestamp': str(request.META.get('HTTP_DATE', '')),
        'method': request.method,
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_status(request):
    """API status endpoint"""
    return JsonResponse({
        'api_version': '1.0',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth/',
            'courses': '/api/courses/',
            'payments': '/api/payments/',
            'tickets': '/api/tickets/',
            'admin': '/api/admin/',
        }
    })
