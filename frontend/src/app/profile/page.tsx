'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper function to convert English digits to Persian
  const englishToPersian = (englishStr: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return englishStr.replace(/[0-9]/g, (char) => persianDigits[englishDigits.indexOf(char)]);
  };

  // Helper function to get full media URL
  const getMediaUrl = (path: string | undefined) => {
    if (!path) return '';
    // If path already starts with http, return as is
    if (path.startsWith('http')) return path;
    // Otherwise, prepend the Django backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${backendUrl}${path.startsWith('/') ? path : '/' + path}`;
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
    }
  }, [user]);

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
              <p>برای مشاهده پروفایل خود، ابتدا وارد حساب کاربری شوید.</p>
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
        .profile-container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }
        
        .profile-sidebar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          height: fit-content;
          position: sticky;
          top: 2rem;
        }
        
        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          margin: 0 auto 1.5rem;
          display: block;
        }
        
        .profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-dark);
          text-align: center;
          margin-bottom: 0.5rem;
        }
        
        .profile-email {
          color: var(--text-light);
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .profile-info {
          background: rgba(99, 102, 241, 0.1);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 600;
          color: var(--text-dark);
        }
        
        .info-value {
          color: var(--text-light);
          text-align: left;
        }
        
        .edit-profile-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .edit-profile-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          color: white;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .dashboard-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .card-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: white;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-dark);
          text-align: center;
          margin-bottom: 0.5rem;
        }
        
        .card-subtitle {
          color: var(--text-light);
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        
        .card-button {
          background: white;
          border: 2px solid #e5e7eb;
          color: var(--text-dark);
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .card-button:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          transform: translateY(-2px);
        }
        
        .status-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 0.5rem;
          display: inline-block;
        }
        
        .stats-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-color);
        }
        
        /* Card Color Themes */
        .card-blue { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
        .card-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .card-purple { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
        .card-orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .card-pink { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
        .card-teal { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); }
        .card-indigo { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
        .card-red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
      `}</style>

      <div className="profile-container">
        <div className="container">
          <div className="row">
            {/* Profile Sidebar */}
            <div className="col-lg-4 mb-4">
              <div className="profile-sidebar">
                {/* Profile Avatar */}
                {profile?.profile_image ? (
                  <img 
                    src={getMediaUrl(profile.profile_image)} 
                    alt={profile.first_name || profile.username} 
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar bg-primary d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                    <i className="fas fa-user"></i>
                  </div>
                )}
                
                {/* Profile Name */}
                <h2 className="profile-name">
                  سلام {profile?.first_name || profile?.username} عزیز!
                </h2>
                <p className="profile-email">{profile?.email}</p>
                
                {/* Profile Information */}
                <div className="profile-info">
                  <div className="info-item">
                    <span className="info-label">نام:</span>
                    <span className="info-value">{profile?.first_name || "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">نام خانوادگی:</span>
                    <span className="info-value">{profile?.last_name || "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">نام کاربری:</span>
                    <span className="info-value">{profile?.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">شماره تلفن:</span>
                    <span className="info-value">{profile?.phone_number || "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">تاریخ تولد:</span>
                    <span className="info-value">{profile?.birth_date ? englishToPersian(profile.birth_date) : "-"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">نوع کاربر:</span>
                    <span className="info-value">{profile?.user_type || "عادی"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">تاریخ عضویت:</span>
                    <span className="info-value">
                      {profile?.date_joined ? englishToPersian(new Date(profile.date_joined).toLocaleDateString('fa-IR')) : "-"}
                    </span>
                  </div>
                </div>
                
                {/* Edit Profile Button */}
                <Link href="/profile/edit" className="btn edit-profile-btn">
                  <i className="fas fa-edit me-2"></i>
                  ویرایش پروفایل
                </Link>
              </div>
            </div>
            
            {/* Dashboard Grid */}
            <div className="col-lg-8">
              <div className="dashboard-grid">
                {/* My Courses */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="100">
                  <div className="card-icon card-blue">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h3 className="card-title">دوره‌های من</h3>
                  <p className="card-subtitle">دوره‌های خریداری شده و در حال یادگیری</p>
                  <Link href="/courses/my" className="btn card-button">
                    <i className="fas fa-eye"></i>
                    مشاهده
                  </Link>
                </div>
                
                {/* Course Progress */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="200">
                  <div className="card-icon card-green">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h3 className="card-title">پیشرفت یادگیری</h3>
                  <p className="card-subtitle">آمار پیشرفت در دوره‌های مختلف</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۷۵%</span>
                    <div className="status-badge">در حال یادگیری</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-plus"></i>
                    ثبت/مشاهده +
                  </button>
                </div>
                
                {/* Payment History */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="300">
                  <div className="card-icon card-orange">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <h3 className="card-title">سوابق پرداخت</h3>
                  <p className="card-subtitle">تاریخچه خریدها و پرداخت‌ها</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۱۲ مورد</span>
                    <div className="status-badge">آخرین: ۲ روز پیش</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-eye"></i>
                    مشاهده
                  </button>
                </div>
                
                {/* Certificates */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="400">
                  <div className="card-icon card-purple">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <h3 className="card-title">گواهی‌نامه‌ها</h3>
                  <p className="card-subtitle">گواهی‌های تکمیل دوره‌ها</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۳ گواهی</span>
                    <div className="status-badge">آخرین: ۱ هفته پیش</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-eye"></i>
                    مشاهده
                  </button>
                </div>
                
                {/* Study Materials */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="500">
                  <div className="card-icon card-teal">
                    <i className="fas fa-book"></i>
                  </div>
                  <h3 className="card-title">منابع مطالعاتی</h3>
                  <p className="card-subtitle">کتاب‌ها، جزوات و منابع آموزشی</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۲۵ فایل</span>
                    <div className="status-badge">PDF، ویدیو، صوت</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-eye"></i>
                    مشاهده
                  </button>
                </div>
                
                {/* Support */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="600">
                  <div className="card-icon card-pink">
                    <i className="fas fa-headset"></i>
                  </div>
                  <h3 className="card-title">پشتیبانی</h3>
                  <p className="card-subtitle">ارتباط با تیم پشتیبانی و اساتید</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۲۴/۷</span>
                    <div className="status-badge">پشتیبانی آنلاین</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-comments"></i>
                    تماس با پشتیبانی
                  </button>
                </div>
                
                {/* Study Schedule */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="700">
                  <div className="card-icon card-indigo">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <h3 className="card-title">برنامه مطالعاتی</h3>
                  <p className="card-subtitle">برنامه‌ریزی و زمان‌بندی مطالعه</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۵ برنامه</span>
                    <div className="status-badge">فعال: ۲ برنامه</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-plus"></i>
                    ایجاد برنامه جدید
                  </button>
                </div>
                
                {/* Achievements */}
                <div className="dashboard-card" data-aos="fade-up" data-aos-delay="800">
                  <div className="card-icon card-red">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <h3 className="card-title">دستاوردها</h3>
                  <p className="card-subtitle">نشان‌ها و دستاوردهای کسب شده</p>
                  <div className="text-center mb-3">
                    <span className="stats-number">۸ نشان</span>
                    <div className="status-badge">آخرین: ۳ روز پیش</div>
                  </div>
                  <button className="btn card-button">
                    <i className="fas fa-eye"></i>
                    مشاهده
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
