'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  birth_date: string;
  user_type: string;
  date_joined: string;
  profile_image?: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  username: string;
  profile_image?: File;
}

export default function ProfileEditPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    birth_date: '',
    username: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper functions for Persian date conversion
  const persianToEnglish = (persianStr: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return persianStr.replace(/[۰-۹]/g, (char) => englishDigits[persianDigits.indexOf(char)]);
  };

  // Helper function to get full media URL
  const getMediaUrl = (path: string | undefined) => {
    if (!path) return '';
    // If path already starts with http or is a data URL, return as is
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    // Otherwise, prepend the Django backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${backendUrl}${path.startsWith('/') ? path : '/' + path}`;
  };

  const englishToPersian = (englishStr: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return englishStr.replace(/[0-9]/g, (char) => persianDigits[englishDigits.indexOf(char)]);
  };

  useEffect(() => {
    setIsLoaded(true);
    // Initialize AOS animations
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100
        });
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfile(user as UserProfile);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        birth_date: user.birth_date ? englishToPersian(user.birth_date) : '',
        username: user.username || '',
      });
      if (user.profile_image) {
        setImagePreview(getMediaUrl(user.profile_image));
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for Persian/English date
    if (name === 'birth_date') {
      // Allow both Persian digits (۰-۹) and English digits (0-9) and forward slashes
      const dateValue = value.replace(/[^۰-۹0-9\/]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: dateValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Check if user is authenticated
    if (!user) {
      setErrors({ general: 'لطفاً ابتدا وارد حساب کاربری خود شوید' });
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone_number', formData.phone_number);
      // Convert Persian date to English and change slashes to dashes (YYYY-MM-DD format)
      const englishDate = persianToEnglish(formData.birth_date).replace(/\//g, '-');
      formDataToSend.append('birth_date', englishDate);
      formDataToSend.append('username', formData.username);
      
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      // Get CSRF token
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf/`, {
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile/`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfData.csrfToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the user data in the context
        await refreshUser();
        // Redirect to profile page
        router.push('/profile');
      } else {
        if (response.status === 403) {
          setErrors({ general: 'لطفاً ابتدا وارد حساب کاربری خود شوید' });
        } else if (response.status === 401) {
          setErrors({ general: 'جلسه شما منقضی شده است. لطفاً دوباره وارد شوید' });
        } else {
          try {
            const errorData = await response.json();
            console.log('Error data:', errorData); // Debug log
            if (errorData.errors) {
              setErrors(errorData.errors);
            } else if (errorData.error) {
              setErrors({ general: errorData.error });
            } else {
              setErrors({ general: 'خطایی در به‌روزرسانی پروفایل رخ داد' });
            }
          } catch (e) {
            setErrors({ general: 'خطایی در به‌روزرسانی پروفایل رخ داد' });
          }
        }
      }
    } catch (error) {
      setErrors({ general: 'خطایی در ارتباط با سرور رخ داد' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="alert alert-warning">
              <h4>لطفاً وارد شوید</h4>
              <p>برای ویرایش پروفایل خود، ابتدا وارد حساب کاربری شوید.</p>
              <Link href="/login" className="btn btn-primary">
                ورود به حساب کاربری
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .profile-edit-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }
        
        .profile-edit-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .profile-edit-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .profile-edit-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }
        
        .profile-edit-subtitle {
          color: var(--text-light);
          font-size: 1.1rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }
        
        .form-control {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
        }
        
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        
        .invalid-feedback {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .btn-save {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          width: 100%;
        }
        
        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          color: white;
        }
        
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-cancel {
          background: transparent;
          border: 2px solid #e5e7eb;
          color: var(--text-dark);
          padding: 13px 40px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 1rem;
        }
        
        .btn-cancel:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: var(--text-dark);
        }
        
        .profile-image-preview {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          margin: 0 auto 1rem;
          display: block;
        }
        
        .image-upload-area {
          text-align: center;
          padding: 2rem;
          border: 2px dashed #d1d5db;
          border-radius: 15px;
          background: #f9fafb;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .image-upload-area:hover {
          border-color: var(--primary-color);
          background: rgba(99, 102, 241, 0.05);
        }
        
        .image-upload-icon {
          font-size: 3rem;
          color: #9ca3af;
          margin-bottom: 1rem;
        }
        
        .image-upload-text {
          color: var(--text-light);
          font-weight: 600;
        }
        
        .form-section {
          background: rgba(99, 102, 241, 0.05);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-icon {
          color: var(--primary-color);
        }
        
        .alert {
          border-radius: 10px;
          border: none;
        }
        
        .persian-date-input {
          font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
          direction: ltr;
          text-align: left;
          font-size: 1rem;
          letter-spacing: 1px;
        }
        
        .persian-date-input::placeholder {
          color: #9ca3af;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="profile-edit-container">
        <div className="container">
          <div className="profile-edit-card">
            <div className="profile-edit-header">
              <h1 className="profile-edit-title">ویرایش پروفایل</h1>
              <p className="profile-edit-subtitle">اطلاعات شخصی خود را به‌روزرسانی کنید</p>
            </div>
            
            {errors.general && (
              <div className="alert alert-danger">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              {/* Profile Image Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-camera section-icon"></i>
                  تصویر پروفایل
                </h3>
                
                <div className="row">
                  <div className="col-md-4 text-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="تصویر فعلی" 
                        className="profile-image-preview"
                      />
                    ) : (
                      <div className="profile-image-preview bg-primary d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="col-md-8">
                    <div 
                      className="image-upload-area" 
                      onClick={() => document.getElementById('profile_image')?.click()}
                    >
                      <i className="fas fa-cloud-upload-alt image-upload-icon"></i>
                      <p className="image-upload-text">برای تغییر تصویر کلیک کنید</p>
                      <small className="text-muted">فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 5MB)</small>
                    </div>
                    <input
                      type="file"
                      id="profile_image"
                      name="profile_image"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Personal Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-user section-icon"></i>
                  اطلاعات شخصی
                </h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="first_name" className="form-label">نام</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        value={formData.first_name}
                        onChange={handleInputChange}
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">
                          {errors.first_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="last_name" className="form-label">نام خانوادگی</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        value={formData.last_name}
                        onChange={handleInputChange}
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback">
                          {errors.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">ایمیل</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone_number" className="form-label">شماره تلفن</label>
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                        value={formData.phone_number}
                        onChange={handleInputChange}
                      />
                      {errors.phone_number && (
                        <div className="invalid-feedback">
                          {errors.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="birth_date" className="form-label">تاریخ تولد</label>
                  <input
                    type="text"
                    id="birth_date"
                    name="birth_date"
                    className={`form-control persian-date-input ${errors.birth_date ? 'is-invalid' : ''}`}
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    placeholder="مثال: ۱۳۷۵/۰۵/۱۵ یا 1375/05/15"
                    dir="ltr"
                    maxLength={10}
                  />
                  {errors.birth_date && (
                    <div className="invalid-feedback">
                      {errors.birth_date}
                    </div>
                  )}
                  <small className="text-muted">فرمت: YYYY/MM/DD - می‌توانید از اعداد فارسی (۱۳۷۵/۰۵/۱۵) یا انگلیسی (1375/05/15) استفاده کنید</small>
                </div>
              </div>
              
              {/* Account Information Section */}
              <div className="form-section">
                <h3 className="section-title">
                  <i className="fas fa-cog section-icon"></i>
                  اطلاعات حساب کاربری
                </h3>
                
                <div className="form-group">
                  <label htmlFor="username" className="form-label">نام کاربری</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="text-center">
                <button 
                  type="submit" 
                  className="btn btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      ذخیره تغییرات
                    </>
                  )}
                </button>
                <Link href="/profile" className="btn btn-cancel">
                  <i className="fas fa-times me-2"></i>
                  انصراف
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
