from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q, Avg, Count
from django.http import JsonResponse
from django.contrib import messages
from django.urls import reverse_lazy
from .models import Course, Category, Section, Video, Review
from payments.models import Cart, CartItem, Enrollment, VideoProgress
import json

class HomeView(ListView):
    model = Course
    template_name = 'courses/home.html'
    context_object_name = 'featured_courses'
    
    def get_queryset(self):
        return Course.objects.filter(is_published=True, is_featured=True)[:6]
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()[:8]
        context['latest_courses'] = Course.objects.filter(is_published=True).order_by('-created_at')[:8]
        return context

class CourseListView(ListView):
    model = Course
    template_name = 'courses/course_list.html'
    context_object_name = 'courses'
    paginate_by = 12
    
    def get_queryset(self):
        queryset = Course.objects.filter(is_published=True).annotate(
            avg_rating=Avg('reviews__rating'),
            total_reviews=Count('reviews')
        )
        
        # Filter by category
        category_slug = self.request.GET.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by difficulty
        difficulty = self.request.GET.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by price
        price_filter = self.request.GET.get('price')
        if price_filter == 'free':
            queryset = queryset.filter(is_free=True)
        elif price_filter == 'paid':
            queryset = queryset.filter(is_free=False)
        
        # Sort
        sort_by = self.request.GET.get('sort', '-created_at')
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-avg_rating')
        else:
            queryset = queryset.order_by(sort_by)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['current_category'] = self.request.GET.get('category', '')
        context['current_difficulty'] = self.request.GET.get('difficulty', '')
        context['current_price'] = self.request.GET.get('price', '')
        context['current_sort'] = self.request.GET.get('sort', '-created_at')
        return context

class CourseDetailView(DetailView):
    model = Course
    template_name = 'courses/course_detail.html'
    context_object_name = 'course'
    
    def get_object(self):
        return get_object_or_404(Course, slug=self.kwargs['slug'], is_published=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        course = self.get_object()
        
        # Check if user is enrolled
        user_enrolled = False
        if self.request.user.is_authenticated:
            user_enrolled = Enrollment.objects.filter(
                user=self.request.user,
                course=course
            ).exists()
        
        context['user_enrolled'] = user_enrolled
        context['reviews'] = course.reviews.all()[:10]
        context['avg_rating'] = course.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        context['total_reviews'] = course.reviews.count()
        context['related_courses'] = Course.objects.filter(
            category=course.category,
            is_published=True
        ).exclude(id=course.id)[:4]
        
        return context

class SectionDetailView(LoginRequiredMixin, DetailView):
    model = Section
    template_name = 'courses/section_detail.html'
    context_object_name = 'section'
    
    def get_object(self):
        course = get_object_or_404(Course, slug=self.kwargs['course_slug'])
        section = get_object_or_404(Section, id=self.kwargs['section_id'], course=course)
        
        # Check if user has access to this section
        if not self.has_access_to_section(section):
            messages.error(self.request, 'شما برای دسترسی به این بخش باید آن را خریداری کنید.')
            return redirect('courses:course_detail', slug=course.slug)
        
        return section
    
    def has_access_to_section(self, section):
        if self.request.user.is_superuser:
            return True
        
        # Check if user has purchased the full course or this specific section
        return Enrollment.objects.filter(
            user=self.request.user
        ).filter(
            Q(course=section.course) | Q(section=section)
        ).exists()

class VideoPlayerView(LoginRequiredMixin, DetailView):
    model = Video
    template_name = 'courses/video_player.html'
    context_object_name = 'video'
    
    def get_object(self):
        course = get_object_or_404(Course, slug=self.kwargs['course_slug'])
        section = get_object_or_404(Section, id=self.kwargs['section_id'], course=course)
        video = get_object_or_404(Video, id=self.kwargs['video_id'], section=section)
        
        # Check if user has access
        if not video.is_preview and not self.has_access_to_video(video):
            messages.error(self.request, 'شما برای دسترسی به این ویدیو باید آن را خریداری کنید.')
            return redirect('courses:course_detail', slug=course.slug)
        
        return video
    
    def has_access_to_video(self, video):
        if self.request.user.is_superuser:
            return True
        
        return Enrollment.objects.filter(
            user=self.request.user
        ).filter(
            Q(course=video.section.course) | Q(section=video.section)
        ).exists()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        video = self.get_object()
        
        # Get user's progress for this video
        progress, created = VideoProgress.objects.get_or_create(
            user=self.request.user,
            video=video
        )
        
        context['progress'] = progress
        context['section'] = video.section
        context['course'] = video.section.course
        context['other_videos'] = video.section.videos.all()
        
        return context

class CategoryDetailView(ListView):
    model = Course
    template_name = 'courses/category_detail.html'
    context_object_name = 'courses'
    paginate_by = 12
    
    def get_queryset(self):
        self.category = get_object_or_404(Category, slug=self.kwargs['slug'])
        return Course.objects.filter(category=self.category, is_published=True)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['category'] = self.category
        return context

class SearchView(ListView):
    model = Course
    template_name = 'courses/search_results.html'
    context_object_name = 'courses'
    paginate_by = 12
    
    def get_queryset(self):
        query = self.request.GET.get('q', '')
        if query:
            return Course.objects.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(short_description__icontains=query),
                is_published=True
            )
        return Course.objects.none()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['query'] = self.request.GET.get('q', '')
        return context

class MyCourseListView(LoginRequiredMixin, ListView):
    template_name = 'courses/my_courses.html'
    context_object_name = 'enrollments'
    
    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course', 'section')

class AddToCartView(LoginRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        item_type = data.get('type')  # 'course' or 'section'
        item_id = data.get('id')
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        try:
            if item_type == 'course':
                course = get_object_or_404(Course, id=item_id)
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    course=course
                )
            else:  # section
                section = get_object_or_404(Section, id=item_id)
                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    section=section
                )
            
            if created:
                return JsonResponse({'success': True, 'message': 'آیتم به سبد خرید اضافه شد'})
            else:
                return JsonResponse({'success': False, 'message': 'این آیتم قبلاً در سبد خرید موجود است'})
                
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'خطا در افزودن به سبد خرید'})

class RemoveFromCartView(LoginRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        item_id = data.get('id')
        
        try:
            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
            cart_item.delete()
            return JsonResponse({'success': True, 'message': 'آیتم از سبد خرید حذف شد'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'خطا در حذف از سبد خرید'})

class UpdateVideoProgressView(LoginRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        video_id = data.get('video_id')
        watched_seconds = data.get('watched_seconds', 0)
        
        try:
            video = get_object_or_404(Video, id=video_id)
            progress, created = VideoProgress.objects.get_or_create(
                user=request.user,
                video=video
            )
            
            progress.watched_seconds = watched_seconds
            if video.duration_seconds and watched_seconds >= video.duration_seconds * 0.9:
                progress.is_completed = True
            progress.save()
            
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

class AddReviewView(LoginRequiredMixin, CreateView):
    model = Review
    fields = ['rating', 'comment']
    template_name = 'courses/add_review.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['course'] = get_object_or_404(Course, slug=self.kwargs['slug'])
        return context
    
    def form_valid(self, form):
        course = get_object_or_404(Course, slug=self.kwargs['slug'])
        
        # Check if user has purchased this course
        if not Enrollment.objects.filter(user=self.request.user, course=course).exists():
            messages.error(self.request, 'فقط کاربرانی که این دوره را خریداری کرده‌اند می‌توانند نظر بدهند.')
            return redirect('courses:course_detail', slug=course.slug)
        
        form.instance.course = course
        form.instance.user = self.request.user
        messages.success(self.request, 'نظر شما با موفقیت ثبت شد!')
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('courses:course_detail', kwargs={'slug': self.kwargs['slug']})
