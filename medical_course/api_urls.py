from django.urls import path, include

urlpatterns = [
    path('auth/', include('accounts.api_urls')),
    path('courses/', include('courses.api_urls')),
    path('payments/', include('payments.api_urls')),
    path('csrf/', include('medical_course.csrf_urls')),
]
