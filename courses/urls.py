from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    # Main pages
    path('', views.HomeView.as_view(), name='home'),
    path('courses/', views.CourseListView.as_view(), name='course_list'),
    path('course/<slug:slug>/', views.CourseDetailView.as_view(), name='course_detail'),
    path('course/<slug:course_slug>/section/<int:section_id>/', views.SectionDetailView.as_view(), name='section_detail'),
    path('course/<slug:course_slug>/section/<int:section_id>/video/<int:video_id>/', views.VideoPlayerView.as_view(), name='video_player'),
    
    # Categories
    path('category/<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
    
    # Search
    path('search/', views.SearchView.as_view(), name='search'),
    
    # My Courses (for enrolled users)
    path('my-courses/', views.MyCourseListView.as_view(), name='my_courses'),
    
    # Ajax endpoints
    path('ajax/add-to-cart/', views.AddToCartView.as_view(), name='add_to_cart'),
    path('ajax/remove-from-cart/', views.RemoveFromCartView.as_view(), name='remove_from_cart'),
    path('ajax/update-video-progress/', views.UpdateVideoProgressView.as_view(), name='update_video_progress'),
    
    # Reviews
    path('course/<slug:slug>/review/', views.AddReviewView.as_view(), name='add_review'),
]
