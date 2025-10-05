from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Q
from .models import Course, Category, Section, Video
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CategorySerializer,
    SectionSerializer, VideoSerializer
)


class CourseListView(APIView):
    """List all published courses"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        courses = Course.objects.filter(is_published=True).select_related(
            'category', 'instructor'
        ).prefetch_related('reviews')
        
        # Filter by category if provided
        category_slug = request.query_params.get('category')
        if category_slug:
            courses = courses.filter(category__slug=category_slug)
        
        # Filter by difficulty if provided
        difficulty = request.query_params.get('difficulty')
        if difficulty:
            courses = courses.filter(difficulty=difficulty)
        
        # Filter by featured if provided
        is_featured = request.query_params.get('featured')
        if is_featured and is_featured.lower() == 'true':
            courses = courses.filter(is_featured=True)
        
        # Order by created_at desc by default
        courses = courses.order_by('-created_at')
        
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)


class CourseDetailView(APIView):
    """Get course detail"""
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            course = Course.objects.filter(
                slug=slug, is_published=True
            ).select_related(
                'category', 'instructor'
            ).prefetch_related(
                'sections__videos', 'reviews__user'
            ).first()
            
            if not course:
                return Response(
                    {'error': 'Course not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = CourseDetailSerializer(course, context={'request': request})
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CategoryListView(APIView):
    """List all categories"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryDetailView(APIView):
    """Get category detail with courses"""
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
            courses = Course.objects.filter(
                category=category, is_published=True
            ).select_related('instructor').prefetch_related('reviews')
            
            category_serializer = CategorySerializer(category)
            courses_serializer = CourseListSerializer(courses, many=True)
            
            return Response({
                'category': category_serializer.data,
                'courses': courses_serializer.data
            })
        except Category.DoesNotExist:
            return Response(
                {'error': 'Category not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CourseSearchView(APIView):
    """Search courses"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'courses': []})
        
        courses = Course.objects.filter(
            Q(title__icontains=query) | 
            Q(short_description__icontains=query) |
            Q(description__icontains=query),
            is_published=True
        ).select_related('category', 'instructor').prefetch_related('reviews')
        
        serializer = CourseListSerializer(courses, many=True)
        return Response({'courses': serializer.data})


class MyCoursesView(APIView):
    """Get user's enrolled courses"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        enrollments = request.user.enrollments.select_related(
            'course__category', 'course__instructor'
        ).prefetch_related('course__reviews')
        
        courses = [enrollment.course for enrollment in enrollments]
        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)


class SectionDetailView(APIView):
    """Get section detail with videos"""
    permission_classes = [AllowAny]
    
    def get(self, request, course_slug, section_id):
        try:
            course = Course.objects.get(slug=course_slug, is_published=True)
            section = Section.objects.get(id=section_id, course=course)
            
            # Check if user is enrolled in the course
            is_enrolled = False
            if request.user.is_authenticated:
                is_enrolled = course.enrollments.filter(user=request.user).exists()
            
            serializer = SectionSerializer(section)
            data = serializer.data
            data['is_enrolled'] = is_enrolled
            
            return Response(data)
        except (Course.DoesNotExist, Section.DoesNotExist):
            return Response(
                {'error': 'Section not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class VideoDetailView(APIView):
    """Get video detail"""
    permission_classes = [AllowAny]
    
    def get(self, request, course_slug, video_id):
        try:
            course = Course.objects.get(slug=course_slug, is_published=True)
            video = Video.objects.get(id=video_id, section__course=course)
            
            # Check if user is enrolled in the course
            is_enrolled = False
            if request.user.is_authenticated:
                is_enrolled = course.enrollments.filter(user=request.user).exists()
            
            # Only allow access to preview videos or enrolled users
            if not video.is_preview and not is_enrolled:
                return Response(
                    {'error': 'Access denied. Please enroll in the course.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = VideoSerializer(video)
            data = serializer.data
            data['is_enrolled'] = is_enrolled
            
            return Response(data)
        except (Course.DoesNotExist, Video.DoesNotExist):
            return Response(
                {'error': 'Video not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
