from django import forms
from django.contrib.auth.forms import UserCreationForm
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Row, Column
from .models import User

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label='ایمیل')
    first_name = forms.CharField(max_length=30, required=True, label='نام')
    last_name = forms.CharField(max_length=30, required=True, label='نام خانوادگی')
    phone_number = forms.CharField(max_length=15, required=False, label='شماره تلفن')
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'password1', 'password2')
        labels = {
            'username': 'نام کاربری',
            'password1': 'رمز عبور',
            'password2': 'تأیید رمز عبور',
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('first_name', css_class='form-group col-md-6 mb-3'),
                Column('last_name', css_class='form-group col-md-6 mb-3'),
                css_class='form-row'
            ),
            Row(
                Column('username', css_class='form-group col-md-6 mb-3'),
                Column('email', css_class='form-group col-md-6 mb-3'),
                css_class='form-row'
            ),
            Field('phone_number', css_class='form-group mb-3'),
            Row(
                Column('password1', css_class='form-group col-md-6 mb-3'),
                Column('password2', css_class='form-group col-md-6 mb-3'),
                css_class='form-row'
            ),
            Submit('submit', 'ثبت‌نام', css_class='btn btn-primary btn-lg w-100')
        )
        
        # Add Bootstrap classes to all fields
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'phone_number', 'birth_date', 'profile_image')
        labels = {
            'username': 'نام کاربری',
            'first_name': 'نام',
            'last_name': 'نام خانوادگی',
            'email': 'ایمیل',
            'phone_number': 'شماره تلفن',
            'birth_date': 'تاریخ تولد',
            'profile_image': 'تصویر پروفایل',
        }
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Field('username', css_class='form-group mb-3'),
            Row(
                Column('first_name', css_class='form-group col-md-6 mb-3'),
                Column('last_name', css_class='form-group col-md-6 mb-3'),
                css_class='form-row'
            ),
            Row(
                Column('email', css_class='form-group col-md-6 mb-3'),
                Column('phone_number', css_class='form-group col-md-6 mb-3'),
                css_class='form-row'
            ),
            Field('birth_date', css_class='form-group mb-3'),
            Field('profile_image', css_class='form-group mb-3'),
            Submit('submit', 'به‌روزرسانی پروفایل', css_class='btn btn-primary btn-lg')
        )
        
        # Add Bootstrap classes to all fields
        for field_name, field in self.fields.items():
            if field_name != 'profile_image':
                field.widget.attrs.update({'class': 'form-control'})
            else:
                field.widget.attrs.update({'class': 'form-control-file'})
