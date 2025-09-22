from django.contrib import admin
from .models import Category, Course, Section, Video, Attachment, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

class VideoInline(admin.StackedInline):
    model = Video
    extra = 0
    fields = ('title', 'description', 'video_file', 'duration_seconds', 'order', 'is_preview')

class AttachmentInline(admin.StackedInline):
    model = Attachment
    extra = 0
    fields = ('title', 'file', 'attachment_type', 'description')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'price', 'is_free', 'created_at')
    list_filter = ('course', 'is_free', 'created_at')
    search_fields = ('title', 'description', 'course__title')
    ordering = ('course', 'order')
    inlines = [VideoInline, AttachmentInline]

class SectionInline(admin.StackedInline):
    model = Section
    extra = 0
    fields = ('title', 'description', 'order', 'price', 'is_free')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'instructor', 'price', 'difficulty', 'is_published', 'is_featured', 'created_at')
    list_filter = ('category', 'difficulty', 'is_published', 'is_featured', 'created_at')
    search_fields = ('title', 'description', 'instructor__username')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ()
    ordering = ('-created_at',)
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('title', 'slug', 'category', 'instructor', 'difficulty')
        }),
        ('محتوا', {
            'fields': ('short_description', 'description', 'prerequisites', 'what_you_learn')
        }),
        ('قیمت‌گذاری', {
            'fields': ('price', 'is_free', 'discount_price')
        }),
        ('رسانه', {
            'fields': ('thumbnail', 'preview_video')
        }),
        ('تنظیمات', {
            'fields': ('duration_hours', 'is_published', 'is_featured')
        }),
    )
    
    inlines = [SectionInline]

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'order', 'duration_seconds', 'is_preview', 'created_at')
    list_filter = ('section__course', 'is_preview', 'created_at')
    search_fields = ('title', 'description', 'section__title')
    ordering = ('section', 'order')

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'attachment_type', 'created_at')
    list_filter = ('attachment_type', 'section__course', 'created_at')
    search_fields = ('title', 'description', 'section__title')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('course', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'course', 'created_at')
    search_fields = ('course__title', 'user__username', 'comment')
    ordering = ('-created_at',)
