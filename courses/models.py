from django.db import models
from django.contrib.auth import get_user_model
from django.urls import reverse
from ckeditor.fields import RichTextField

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Course(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'مبتدی'),
        ('intermediate', 'متوسط'),
        ('advanced', 'پیشرفته'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = RichTextField()
    short_description = models.TextField(max_length=500)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_free = models.BooleanField(default=False)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Course details
    duration_hours = models.PositiveIntegerField(help_text="مدت زمان کل دوره به ساعت")
    prerequisites = models.TextField(blank=True, help_text="پیش‌نیازهای دوره")
    what_you_learn = models.TextField(help_text="چیزهایی که یاد خواهید گرفت")
    
    # Media
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    preview_video = models.FileField(upload_to='course_previews/', blank=True, null=True)
    
    # Status
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('courses:course_detail', kwargs={'slug': self.slug})
    
    def get_effective_price(self):
        return self.discount_price if self.discount_price else self.price
    
    def get_total_sections(self):
        return self.sections.count()
    
    def get_total_videos(self):
        return sum(section.videos.count() for section in self.sections.all())

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    # Pricing for individual section purchase
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_free = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    def get_total_videos(self):
        return self.videos.count()
    
    def get_duration(self):
        total_seconds = sum(video.duration_seconds or 0 for video in self.videos.all())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"

class Video(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='course_videos/')
    duration_seconds = models.PositiveIntegerField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    
    # Video settings
    is_preview = models.BooleanField(default=False, help_text="آیا این ویدیو رایگان قابل مشاهده است؟")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['section', 'order']
    
    def __str__(self):
        return f"{self.section.title} - {self.title}"

class Attachment(models.Model):
    ATTACHMENT_TYPES = [
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('image', 'Image'),
        ('other', 'Other'),
    ]
    
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='attachments')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='course_attachments/')
    attachment_type = models.CharField(max_length=10, choices=ATTACHMENT_TYPES, default='pdf')
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.section.title} - {self.title}"

class Review(models.Model):
    RATING_CHOICES = [
        (1, '۱ ستاره'),
        (2, '۲ ستاره'),
        (3, '۳ ستاره'),
        (4, '۴ ستاره'),
        (5, '۵ ستاره'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.user.username} ({self.rating}/5)"
