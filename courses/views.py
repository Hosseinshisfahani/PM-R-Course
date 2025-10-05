# This file now only contains API views and utility functions
# Template-based views have been migrated to React frontend

from django.shortcuts import get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.contrib import messages
from .models import Course, Category, Section, Video, Review
from payments.models import Cart, CartItem, Enrollment, VideoProgress
import json

class AddToCartView(LoginRequiredMixin, View):
    """API endpoint for adding items to cart"""
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
    """API endpoint for removing items from cart"""
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
    """API endpoint for updating video progress"""
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

class AddReviewView(LoginRequiredMixin, View):
    """API endpoint for adding course reviews"""
    def post(self, request):
        data = json.loads(request.body)
        course_slug = data.get('course_slug')
        rating = data.get('rating')
        comment = data.get('comment')
        
        try:
            course = get_object_or_404(Course, slug=course_slug)
            
            # Check if user has purchased this course
            if not Enrollment.objects.filter(user=request.user, course=course).exists():
                return JsonResponse({
                    'success': False, 
                    'message': 'فقط کاربرانی که این دوره را خریداری کرده‌اند می‌توانند نظر بدهند.'
                })
            
            # Check if user already reviewed this course
            existing_review = Review.objects.filter(user=request.user, course=course).first()
            if existing_review:
                existing_review.rating = rating
                existing_review.comment = comment
                existing_review.save()
                return JsonResponse({'success': True, 'message': 'نظر شما به‌روزرسانی شد'})
            else:
                Review.objects.create(
                    user=request.user,
                    course=course,
                    rating=rating,
                    comment=comment
                )
                return JsonResponse({'success': True, 'message': 'نظر شما با موفقیت ثبت شد'})
                
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})