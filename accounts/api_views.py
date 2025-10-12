from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import User
from .serializers import UserSerializer


class UserProfileView(APIView):
    """Get current user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LoginView(APIView):
    """Login user with email and password"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'ایمیل و رمز عبور الزامی است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=email, password=password)
        if user is not None:
            # Set the authentication backend
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'message': 'ورود موفقیت‌آمیز بود'
            })
        else:
            return Response(
                {'error': 'ایمیل یا رمز عبور اشتباه است'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """Logout current user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'خروج موفقیت‌آمیز بود'})


class SignupView(APIView):
    """Register new user"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone_number = request.data.get('phone_number', '')
        username = request.data.get('username', '')
        
        if not email or not password:
            return Response(
                {'error': 'ایمیل و رمز عبور الزامی است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check username if provided
        if username and User.objects.filter(username=username).exists():
            return Response(
                {'error': 'این نام کاربری قبلاً استفاده شده است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validate_password(password)
        except ValidationError as e:
            # Translate password validation errors to Persian
            persian_errors = []
            for msg in e.messages:
                if 'too short' in msg.lower() or 'at least' in msg.lower():
                    persian_errors.append('رمز عبور باید حداقل ۸ کاراکتر باشد')
                elif 'too common' in msg.lower():
                    persian_errors.append('رمز عبور خیلی ساده است')
                elif 'numeric' in msg.lower() or 'number' in msg.lower():
                    persian_errors.append('رمز عبور نباید فقط عدد باشد')
                elif 'similar' in msg.lower():
                    persian_errors.append('رمز عبور نباید شبیه اطلاعات شخصی شما باشد')
                else:
                    persian_errors.append(msg)
            
            return Response(
                {'error': 'رمز عبور نامعتبر است', 'details': persian_errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use username if provided, otherwise use email
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            username=username if username else email
        )
        
        # Auto-login after signup
        # Set the authentication backend
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': 'حساب کاربری با موفقیت ایجاد شد'
        }, status=status.HTTP_201_CREATED)


class ProfileUpdateView(APIView):
    """Update user profile"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        data = request.data.copy()
        
        # Update user fields - only if provided and not empty
        if 'first_name' in data and data.get('first_name'):
            user.first_name = data.get('first_name')
        if 'last_name' in data and data.get('last_name'):
            user.last_name = data.get('last_name')
        if 'email' in data and data.get('email'):
            user.email = data.get('email')
        if 'phone_number' in data and data.get('phone_number'):
            user.phone_number = data.get('phone_number')
        if 'birth_date' in data and data.get('birth_date'):
            user.birth_date = data.get('birth_date')
        if 'username' in data and data.get('username'):
            user.username = data.get('username')
        
        # Handle profile image
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
        
        try:
            user.full_clean()
            user.save()
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'message': 'پروفایل با موفقیت به‌روزرسانی شد'
            })
        except ValidationError as e:
            errors = {}
            if hasattr(e, 'message_dict'):
                for field, messages in e.message_dict.items():
                    errors[field] = messages[0] if isinstance(messages, list) else str(messages)
            return Response(
                {'error': 'اطلاعات نامعتبر است', 'errors': errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'خطایی در به‌روزرسانی پروفایل رخ داد', 'detail': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
