from rest_framework import serializers
from .models import Course, Category, Section, Video, Review


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'course_count']
    
    def get_course_count(self, obj):
        return obj.courses.filter(is_published=True).count()


class VideoSerializer(serializers.ModelSerializer):
    """Video serializer"""
    duration_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_file', 'duration_seconds',
            'duration_formatted', 'order', 'is_preview', 'created_at'
        ]
    
    def get_duration_formatted(self, obj):
        if not obj.duration_seconds:
            return "0:00"
        minutes = obj.duration_seconds // 60
        seconds = obj.duration_seconds % 60
        return f"{minutes}:{seconds:02d}"


class SectionSerializer(serializers.ModelSerializer):
    """Section serializer"""
    videos = VideoSerializer(many=True, read_only=True)
    total_videos = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'title', 'description', 'order', 'price', 'is_free',
            'total_videos', 'duration', 'videos', 'created_at'
        ]
    
    def get_total_videos(self, obj):
        return obj.videos.count()
    
    def get_duration(self, obj):
        return obj.get_duration()


class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    """Course list serializer (minimal data)"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    effective_price = serializers.SerializerMethodField()
    total_sections = serializers.SerializerMethodField()
    total_videos = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'short_description', 'category_name',
            'instructor_name', 'difficulty', 'effective_price', 'is_free',
            'duration_hours', 'total_sections', 'total_videos',
            'average_rating', 'review_count', 'thumbnail', 'is_featured',
            'created_at'
        ]
    
    def get_effective_price(self, obj):
        return obj.get_effective_price()
    
    def get_total_sections(self, obj):
        return obj.get_total_sections()
    
    def get_total_videos(self, obj):
        return obj.get_total_videos()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None
    
    def get_review_count(self, obj):
        return obj.reviews.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer (full data)"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    effective_price = serializers.SerializerMethodField()
    sections = SectionSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    total_sections = serializers.SerializerMethodField()
    total_videos = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'category_name', 'instructor_name', 'difficulty', 'effective_price',
            'is_free', 'duration_hours', 'prerequisites', 'what_you_learn',
            'total_sections', 'total_videos', 'average_rating', 'review_count',
            'thumbnail', 'preview_video', 'is_featured', 'is_published',
            'sections', 'reviews', 'is_enrolled', 'created_at', 'updated_at'
        ]
    
    def get_effective_price(self, obj):
        return obj.get_effective_price()
    
    def get_total_sections(self, obj):
        return obj.get_total_sections()
    
    def get_total_videos(self, obj):
        return obj.get_total_videos()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None
    
    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False
