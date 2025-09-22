from django import forms
from django.contrib.auth import get_user_model
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, HTML, Div
from crispy_forms.bootstrap import Field

User = get_user_model()

class JoinMarketersForm(forms.Form):
    """Form for users to request joining the marketers club"""
    
    EXPERIENCE_CHOICES = [
        ('beginner', 'مبتدی - تجربه کمی در فروش'),
        ('intermediate', 'متوسط - تجربه متوسط در فروش'),
        ('advanced', 'پیشرفته - تجربه زیاد در فروش'),
        ('expert', 'متخصص - تجربه بسیار زیاد در فروش'),
    ]
    
    INTEREST_CHOICES = [
        ('medical', 'دوره‌های پزشکی و سلامت'),
        ('technology', 'دوره‌های تکنولوژی'),
        ('business', 'دوره‌های کسب و کار'),
        ('education', 'دوره‌های آموزشی'),
        ('all', 'همه موضوعات'),
    ]
    
    # Personal Information
    full_name = forms.CharField(
        max_length=100,
        label='نام و نام خانوادگی',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'نام و نام خانوادگی خود را وارد کنید'
        })
    )
    
    phone_number = forms.CharField(
        max_length=15,
        label='شماره تماس',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '09123456789'
        })
    )
    
    email = forms.EmailField(
        label='ایمیل',
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'example@email.com'
        })
    )
    
    # Professional Information
    experience_level = forms.ChoiceField(
        choices=EXPERIENCE_CHOICES,
        label='سطح تجربه در فروش',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    current_job = forms.CharField(
        max_length=100,
        label='شغل فعلی',
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'شغل فعلی خود را وارد کنید (اختیاری)'
        })
    )
    
    # Interest and Motivation
    interest_area = forms.ChoiceField(
        choices=INTEREST_CHOICES,
        label='حوزه علاقه‌مندی',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    
    motivation = forms.CharField(
        label='انگیزه شما از پیوستن به تیم فروشندگان',
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'دلایل خود را برای پیوستن به تیم فروشندگان بنویسید...'
        })
    )
    
    # Marketing Experience
    marketing_experience = forms.CharField(
        label='تجربه بازاریابی و فروش',
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'تجربیات قبلی خود در زمینه بازاریابی و فروش را شرح دهید (اختیاری)'
        })
    )
    
    # Social Media
    instagram_handle = forms.CharField(
        max_length=100,
        label='آیدی اینستاگرام',
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '@your_instagram_handle'
        })
    )
    
    telegram_handle = forms.CharField(
        max_length=100,
        label='آیدی تلگرام',
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '@your_telegram_handle'
        })
    )
    
    # Agreement
    agree_to_terms = forms.BooleanField(
        label='با شرایط و قوانین تیم فروشندگان موافقم',
        required=True,
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.form_class = 'needs-validation'
        self.helper.attrs = {'novalidate': True}
        
        self.helper.layout = Layout(
            HTML('<div class="text-center mb-4">'
                 '<h3 class="text-primary"><i class="fas fa-handshake me-2"></i>درخواست پیوستن به تیم فروشندگان</h3>'
                 '<p class="text-muted">فرم زیر را پر کنید تا درخواست شما بررسی شود</p>'
                 '</div>'),
            
            # Personal Information Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-primary text-white">'
                 '<h5 class="mb-0"><i class="fas fa-user me-2"></i>اطلاعات شخصی</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            Row(
                Column('full_name', css_class='col-md-6'),
                Column('phone_number', css_class='col-md-6'),
            ),
            Row(
                Column('email', css_class='col-md-12'),
            ),
            
            HTML('</div></div>'),
            
            # Professional Information Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-success text-white">'
                 '<h5 class="mb-0"><i class="fas fa-briefcase me-2"></i>اطلاعات حرفه‌ای</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            Row(
                Column('experience_level', css_class='col-md-6'),
                Column('current_job', css_class='col-md-6'),
            ),
            
            HTML('</div></div>'),
            
            # Interest and Motivation Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-info text-white">'
                 '<h5 class="mb-0"><i class="fas fa-heart me-2"></i>علاقه‌مندی و انگیزه</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            Row(
                Column('interest_area', css_class='col-md-6'),
            ),
            'motivation',
            
            HTML('</div></div>'),
            
            # Marketing Experience Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-warning text-dark">'
                 '<h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>تجربه بازاریابی</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            'marketing_experience',
            
            HTML('</div></div>'),
            
            # Social Media Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-secondary text-white">'
                 '<h5 class="mb-0"><i class="fas fa-share-alt me-2"></i>شبکه‌های اجتماعی</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            Row(
                Column('instagram_handle', css_class='col-md-6'),
                Column('telegram_handle', css_class='col-md-6'),
            ),
            
            HTML('</div></div>'),
            
            # Agreement Section
            HTML('<div class="card mb-4">'
                 '<div class="card-header bg-dark text-white">'
                 '<h5 class="mb-0"><i class="fas fa-file-contract me-2"></i>موافقت با شرایط</h5>'
                 '</div>'
                 '<div class="card-body">'),
            
            Div(
                Field('agree_to_terms', css_class='form-check'),
                css_class='form-check'
            ),
            
            HTML('<div class="alert alert-info mt-3">'
                 '<h6><i class="fas fa-info-circle me-2"></i>شرایط و قوانین:</h6>'
                 '<ul class="mb-0">'
                 '<li>کمیسیون ۱۰٪ از هر فروش موفق</li>'
                 '<li>پرداخت ماهانه کمیسیون‌ها</li>'
                 '<li>رعایت اصول اخلاقی در فروش</li>'
                 '<li>عدم فروش به قیمت کمتر از قیمت تعیین شده</li>'
                 '</ul>'
                 '</div>'),
            
            HTML('</div></div>'),
            
            # Submit Button
            Div(
                Submit('submit', 'ارسال درخواست', css_class='btn btn-success btn-lg w-100'),
                css_class='text-center'
            )
        )
