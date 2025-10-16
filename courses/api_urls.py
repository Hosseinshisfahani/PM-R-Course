from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.CourseListView.as_view(), name='api_course_list'),
    path('categories/', api_views.CategoryListView.as_view(), name='api_category_list'),
    path('categories/<slug:slug>/', api_views.CategoryDetailView.as_view(), name='api_category_detail'),
    path('search/', api_views.CourseSearchView.as_view(), name='api_course_search'),
    path('my-courses/', api_views.MyCoursesView.as_view(), name='api_my_courses'),
    path('packages/', api_views.PackageListView.as_view(), name='api_package_list'),
    path('packages/<slug:slug>/', api_views.PackageDetailView.as_view(), name='api_package_detail'),
    path('<slug:course_slug>/sections/<int:section_id>/', api_views.SectionDetailView.as_view(), name='api_section_detail'),
    path('<slug:course_slug>/videos/<int:video_id>/', api_views.VideoDetailView.as_view(), name='api_video_detail'),
    path('<slug:slug>/', api_views.CourseDetailView.as_view(), name='api_course_detail'),
]
