'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarketerStats {
  totalEarnings: number;
  totalSales: number;
  conversionRate: number;
  topPerformingCourse: string;
}

export default function MarketersPage() {
  const [stats, setStats] = useState<MarketerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalEarnings: 2500000,
        totalSales: 45,
        conversionRate: 12.5,
        topPerformingCourse: 'استئوپاتی مقدماتی'
      });
      setLoading(false);
    }, 1000);
  }, []);

  const features = [
    {
      icon: 'fas fa-percentage',
      title: 'کمیسیون ۱۰٪',
      description: 'از هر فروش موفق ۱۰٪ کمیسیون دریافت کنید'
    },
    {
      icon: 'fas fa-gift',
      title: 'کد معرفی',
      description: 'کد معرفی منحصر به فرد برای مشتریان خود'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'گزارش‌گیری',
      description: 'گزارش‌های دقیق فروش و درآمد'
    },
    {
      icon: 'fas fa-headset',
      title: 'پشتیبانی',
      description: 'پشتیبانی تخصصی برای فروشندگان'
    },
    {
      icon: 'fas fa-certificate',
      title: 'گواهی فروشنده',
      description: 'گواهی رسمی فروشنده معتبر'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'پنل موبایل',
      description: 'دسترسی آسان از طریق موبایل'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'ثبت‌نام',
      description: 'فرم درخواست فروشنده را تکمیل کنید',
      icon: 'fas fa-user-plus'
    },
    {
      number: 2,
      title: 'تایید',
      description: 'پس از بررسی، حساب شما فعال می‌شود',
      icon: 'fas fa-check-circle'
    },
    {
      number: 3,
      title: 'کد معرفی',
      description: 'کد معرفی منحصر به فرد دریافت کنید',
      icon: 'fas fa-qrcode'
    },
    {
      number: 4,
      title: 'شروع فروش',
      description: 'فروش دوره‌ها را آغاز کنید',
      icon: 'fas fa-rocket'
    }
  ];

  const courses = [
    {
      title: 'استئوپاتی مقدماتی',
      price: 1200000,
      commission: 120000,
      image: '/static/images/course1.jpg'
    },
    {
      title: 'استئوپاتی متوسط',
      price: 2000000,
      commission: 200000,
      image: '/static/images/course2.jpg'
    },
    {
      title: 'استئوپاتی پیشرفته',
      price: 2800000,
      commission: 280000,
      image: '/static/images/course3.jpg'
    },
    {
      title: 'پکیج کامل استئوپاتی',
      price: 4500000,
      commission: 450000,
      image: '/static/images/package.jpg'
    }
  ];

  return (
    <div className="marketers-page">
      {/* Hero Section */}
      <section className="marketers-hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="hero-content">
                <h1 className="hero-title">
                  <i className="fas fa-handshake me-3 text-primary"></i>
                  به تیم فروشندگان ما بپیوندید
                </h1>
                <p className="hero-subtitle">
                  با فروش دوره‌های آموزشی ما، درآمد مناسبی کسب کنید. 
                  کمیسیون ۱۰٪ از هر فروش موفق + پشتیبانی کامل
                </p>
                <div className="hero-stats">
                  <div className="row">
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">۱۰٪</div>
                        <div className="stat-label">کمیسیون</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">۲۴/۷</div>
                        <div className="stat-label">پشتیبانی</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">فوری</div>
                        <div className="stat-label">پرداخت</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hero-actions">
                  <button className="btn btn-primary btn-lg me-3">
                    <i className="fas fa-user-plus me-2"></i>
                    ثبت‌نام فروشنده
                  </button>
                  <Link href="#features" className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-info-circle me-2"></i>
                    اطلاعات بیشتر
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="hero-image">
                <div className="marketer-card">
                  <div className="card-header">
                    <div className="avatar">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="user-info">
                      <h5>فروشنده موفق</h5>
                      <p>عضو از ۱۴۰۲</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="earnings">
                      <div className="earning-item">
                        <span className="label">درآمد این ماه:</span>
                        <span className="value">۲,۵۰۰,۰۰۰ تومان</span>
                      </div>
                      <div className="earning-item">
                        <span className="label">فروش موفق:</span>
                        <span className="value">۴۵ دوره</span>
                      </div>
                      <div className="earning-item">
                        <span className="label">نرخ تبدیل:</span>
                        <span className="value">۱۲.۵٪</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">مزایای فروشندگی</h2>
            <p className="section-subtitle">چرا باید فروشنده ما شوید؟</p>
          </div>
          
          <div className="row">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className={feature.icon}></i>
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">نحوه کار</h2>
            <p className="section-subtitle">چگونه فروشنده شوید؟</p>
          </div>
          
          <div className="row">
            {steps.map((step, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="step-card">
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">
                    <i className={step.icon}></i>
                  </div>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">دوره‌های قابل فروش</h2>
            <p className="section-subtitle">دوره‌هایی که می‌توانید بفروشید</p>
          </div>
          
          <div className="row">
            {courses.map((course, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="course-card">
                  <div className="course-image">
                    <div className="course-overlay">
                      <span className="commission-badge">
                        کمیسیون: {Math.round(course.commission).toLocaleString()} تومان
                      </span>
                    </div>
                  </div>
                  <div className="course-content">
                    <h5 className="course-title">{course.title}</h5>
                    <div className="course-price">
                      <span className="price">{Math.round(course.price).toLocaleString()} تومان</span>
                    </div>
                    <div className="course-commission">
                      <i className="fas fa-percentage me-2"></i>
                      <span>کمیسیون شما: {Math.round(course.commission).toLocaleString()} تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="stats-section py-5">
          <div className="container">
            <div className="text-center mb-5" data-aos="fade-up">
              <h2 className="section-title">آمار فروشندگان</h2>
              <p className="section-subtitle">عملکرد فروشندگان ما</p>
            </div>
            
            <div className="row">
              <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="100">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-dollar-sign"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{Math.round(stats.totalEarnings).toLocaleString()}</div>
                    <div className="stat-label">تومان درآمد کل</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="200">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.totalSales}</div>
                    <div className="stat-label">فروش موفق</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="300">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.conversionRate}%</div>
                    <div className="stat-label">نرخ تبدیل</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="400">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.topPerformingCourse}</div>
                    <div className="stat-label">محبوب‌ترین دوره</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card" data-aos="fade-up">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3 className="cta-title">آماده شروع هستید؟</h3>
                <p className="cta-description">
                  همین حالا به تیم فروشندگان ما بپیوندید و درآمد خود را شروع کنید
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <button className="btn btn-primary btn-lg">
                  <i className="fas fa-rocket me-2"></i>
                  شروع کنید
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .marketers-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .marketers-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .marketers-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('/static/images/hero-pattern.svg') no-repeat center center;
          background-size: cover;
          opacity: 0.1;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-stats {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .marketer-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .avatar {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
          font-size: 1.5rem;
        }

        .user-info h5 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .user-info p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .earning-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .earning-item:last-child {
          border-bottom: none;
        }

        .label {
          opacity: 0.8;
        }

        .value {
          font-weight: 600;
          color: #4ade80;
        }

        .features-section {
          background: #f8f9fa;
        }

        .feature-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: white;
        }

        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .feature-description {
          color: #666;
          line-height: 1.6;
        }

        .how-it-works-section {
          background: white;
        }

        .step-card {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          position: relative;
          height: 100%;
        }

        .step-number {
          position: absolute;
          top: -15px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .step-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem auto 1.5rem;
          font-size: 1.5rem;
          color: white;
        }

        .step-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .step-description {
          color: #666;
          line-height: 1.6;
        }

        .courses-section {
          background: #f8f9fa;
        }

        .course-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-overlay {
          position: absolute;
          top: 15px;
          left: 15px;
        }

        .commission-badge {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .course-content {
          padding: 1.5rem;
        }

        .course-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .course-price {
          margin-bottom: 1rem;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 700;
          color: #667eea;
        }

        .course-commission {
          background: #e8f5e8;
          color: #2d5a2d;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .stats-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: 100%;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .cta-section {
          background: #f8f9fa;
        }

        .cta-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-description {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .marketer-card {
            margin-top: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
