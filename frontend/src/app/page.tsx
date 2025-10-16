'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

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

  return (
    <>
      {/* Hero Section - Instructor */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 0 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="position-relative">
                <div className="hero-image-container" style={{
                  height: '500px',
                  borderRadius: '30px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
                }}>
                  <img 
                    src="/static/images/e9e04d9c-a770-4bd3-a1e0-8196184ae5b2.jpeg" 
                    alt="استاد دانیال یاسری فر" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                      borderRadius: '30px'
                    }}
                  />
                  <div className="position-absolute" style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(102, 126, 234, 0.4) 0%, transparent 50%)',
                    borderRadius: '30px'
                  }}></div>
                </div>
              </div>
            </div>
            <div className="col-lg-7 hero-content ps-lg-5" data-aos="fade-left">
              <div className="badge mb-3" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <i className="fas fa-award me-2"></i>
                آکادمی تخصصی طب فیزیکی
              </div>
              <h1 className="hero-title mb-4" style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2' }}>
                استاد دانیال یاسری فر
              </h1>
              <p className="hero-subtitle mb-4" style={{ fontSize: '1.4rem', opacity: '0.95' }}>
                متخصص تدریس دوره های طب فیزیکی
              </p>
              <p style={{ fontSize: '1.1rem', opacity: '0.9', marginBottom: '2rem' }}>
                آموزش حرفه‌ای استئوپاتی با روش‌های تلفیقی از طب کهن ایرانی و طب نوین
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/courses" className="btn btn-lg" style={{
                  background: 'white',
                          border: 'none', 
                  color: '#667eea',
                  fontWeight: '700',
                  padding: '16px 40px',
                          borderRadius: '50px', 
                  boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}>
                  <i className="fas fa-graduation-cap me-2"></i>
                  مشاهده دوره‌ها
                </Link>
                <Link href="#features" className="btn btn-lg" style={{
                  border: '2px solid white',
                          color: 'white', 
                  fontWeight: '700',
                  padding: '14px 40px',
                  borderRadius: '50px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}>
                  <i className="fas fa-arrow-down me-2"></i>
                  بیشتر بدانید
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(50px)'
        }}></div>
      </section>

      {/* Features Grid - Inspired Design */}
      <section id="features" className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 style={{ color: '#1f2937', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              دسترسی سریع
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>
              تمام آنچه برای یادگیری حرفه‌ای نیاز دارید
            </p>
          </div>
          
          <div className="row g-4">
            {/* Feature Card 1 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <Link href="/marketers" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-users fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>باشگاه فروشندگان</h5>
                    </Link>
            </div>
            
            {/* Feature Card 2 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="150">
              <Link href="/packages" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(240, 147, 251, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-gift fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>پکیج های ویژه</h5>
              </Link>
                  </div>
                  
            {/* Feature Card 3 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <Link href="/courses" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(79, 172, 254, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-th-large fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>همه دوره ها</h5>
                    </Link>
                  </div>
            
            {/* Feature Card 4 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="250">
              <Link href="/profile" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(67, 233, 123, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-user fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>پروفایل</h5>
              </Link>
            </div>
            
            {/* Feature Card 5 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <Link href="/about" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(250, 112, 154, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-info-circle fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>درباره ما</h5>
              </Link>
                  </div>
                  
            {/* Feature Card 6 */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="350">
              <Link href="/marketers/join" className="feature-card enhanced-card" style={{ 
                textDecoration: 'none', 
                color: 'white',
                display: 'block',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '25px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(168, 237, 234, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="card-shine"></div>
                <div className="feature-icon" style={{ color: 'white' }}>
                  <i className="fas fa-user-plus fa-3x"></i>
                </div>
                <h5 style={{ color: 'white', fontWeight: '700' }}>پیوستن به تیم فروشندگان</h5>
              </Link>
          </div>
          
          </div>
        </div>
      </section>

      {/* Courses Section - Modern Card Design */}
      <section id="courses" className="py-5" style={{ background: 'white' }}>
        <div className="container py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 style={{ color: '#1f2937', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              دوره‌های آموزشی
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>
              مسیر یادگیری خود را انتخاب کنید
            </p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {/* Beginner Course */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="100">
              <div className="course-card" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' }}>
                <div className="course-icon" style={{ color: '#0284c7' }}>
                  <i className="fas fa-book-open fa-4x"></i>
                    </div>
                <h4 style={{ color: '#0c4a6e', fontWeight: '700', marginBottom: '1rem' }}>مقدماتی</h4>
                <p style={{ color: '#475569', marginBottom: '1.5rem', minHeight: '60px' }}>
                  آموزش اصول اولیه طب فیزیکی و مفاهیم پایه
                </p>
                <div className="course-meta">
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-clock me-1"></i>
                      ۲۰ ساعت
                    </span>
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-layer-group me-1"></i>
                      ۵ بخش
                    </span>
                  </div>
                  <div className="price mb-3" style={{ color: '#0284c7', fontSize: '1.5rem', fontWeight: '800' }}>
                    ۱,۵۰۰,۰۰۰ تومان
                  </div>
                  <Link href="/courses/moghaddamati" className="course-btn" style={{ background: '#0284c7' }}>
                    <i className="fas fa-arrow-left me-2"></i>
                    شروع دوره
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Intermediate Course */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="200">
              <div className="course-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                <div className="course-icon" style={{ color: '#d97706' }}>
                  <i className="fas fa-user-graduate fa-4x"></i>
                    </div>
                <h4 style={{ color: '#78350f', fontWeight: '700', marginBottom: '1rem' }}>متوسط</h4>
                <p style={{ color: '#475569', marginBottom: '1.5rem', minHeight: '60px' }}>
                  آموزش مفاهیم متوسط و تکنیک‌های درمانی پیشرفته
                </p>
                <div className="course-meta">
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-clock me-1"></i>
                      ۳۰ ساعت
                    </span>
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-layer-group me-1"></i>
                      ۶ بخش
                    </span>
                  </div>
                  <div className="price mb-3" style={{ color: '#d97706', fontSize: '1.5rem', fontWeight: '800' }}>
                    ۲,۵۰۰,۰۰۰ تومان
                  </div>
                  <Link href="/courses/motavaset" className="course-btn" style={{ background: '#d97706' }}>
                    <i className="fas fa-arrow-left me-2"></i>
                    شروع دوره
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Advanced Course */}
            <div className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay="300">
              <div className="course-card" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' }}>
                <div className="course-icon" style={{ color: '#db2777' }}>
                  <i className="fas fa-trophy fa-4x"></i>
                    </div>
                <h4 style={{ color: '#831843', fontWeight: '700', marginBottom: '1rem' }}>پیشرفته</h4>
                <p style={{ color: '#475569', marginBottom: '1.5rem', minHeight: '60px' }}>
                  آموزش تخصصی و پیشرفته برای متخصصان
                </p>
                <div className="course-meta">
                  <div className="d-flex justify-content-between mb-3">
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-clock me-1"></i>
                      ۴۰ ساعت
                    </span>
                    <span style={{ color: '#64748b' }}>
                      <i className="fas fa-layer-group me-1"></i>
                      ۸ بخش
                    </span>
                  </div>
                  <div className="price mb-3" style={{ color: '#db2777', fontSize: '1.5rem', fontWeight: '800' }}>
                    ۳,۵۰۰,۰۰۰ تومان
                  </div>
                  <Link href="/courses/pishrafte" className="course-btn" style={{ background: '#db2777' }}>
                    <i className="fas fa-arrow-left me-2"></i>
                    شروع دوره
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-5" data-aos="fade-up">
            <Link href="/courses" className="btn btn-lg" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none', 
              color: 'white',
              fontWeight: '700',
              padding: '16px 40px',
                      borderRadius: '50px', 
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}>
              <i className="fas fa-th-large me-2"></i>
              مشاهده همه دوره‌ها
                    </Link>
          </div>
        </div>
      </section>

      {/* Career Opportunities Section */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 style={{ color: '#1f2937', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              فرصت‌های شغلی
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>
              پس از گذراندن دوره‌ها، در مسیرهای مختلف شغلی فعالیت کنید
            </p>
          </div>
          
          <div className="row g-4">
            {/* Career 1 */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="career-card">
                <div className="career-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <i className="fas fa-clinic-medical fa-2x"></i>
                </div>
                <h5>درمانگر طب فیزیکی</h5>
                <p>فعالیت در کلینیک‌های تخصصی</p>
              </div>
            </div>
            
            {/* Career 2 */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="150">
              <div className="career-card">
                <div className="career-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <i className="fas fa-hospital fa-2x"></i>
                </div>
                <h5>استئوپات بیمارستانی</h5>
                <p>همکاری با بیمارستان‌ها</p>
              </div>
            </div>
            
            {/* Career 3 */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="career-card">
                <div className="career-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <i className="fas fa-dumbbell fa-2x"></i>
                </div>
                <h5>مربی ورزشی درمانی</h5>
                <p>همکاری با باشگاه‌های ورزشی</p>
              </div>
            </div>
            
            {/* Career 4 */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="250">
              <div className="career-card">
                <div className="career-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <i className="fas fa-user-tie fa-2x"></i>
                </div>
                <h5>مشاور تخصصی</h5>
                <p>راه‌اندازی مطب شخصی</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Statistics Section */}
      <section className="py-5" style={{ background: 'white' }}>
        <div className="container py-5">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#667eea' }}>۱۰۰+</div>
                <div className="stat-label">ویدئو آموزشی</div>
                  </div>
                </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#764ba2' }}>۹۰+</div>
                <div className="stat-label">ساعت آموزش</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#f093fb' }}>۳</div>
                <div className="stat-label">سطح آموزشی</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#43e97b' }}>۲۴/۷</div>
                <div className="stat-label">پشتیبانی</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container text-center text-white py-5" style={{ position: 'relative', zIndex: 2 }}>
          <div data-aos="fade-up">
            <h2 className="fw-bold mb-4" style={{ fontSize: '2.5rem' }}>
              آماده شروع یادگیری هستید؟
            </h2>
            <p className="mb-5" style={{ fontSize: '1.2rem', opacity: '0.95' }}>
              همین حالا ثبت‌نام کنید و به آکادمی تخصصی طب فیزیکی بپیوندید
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link href="/signup" className="cta-btn" style={{ background: 'white', color: '#667eea' }}>
                <i className="fas fa-user-plus me-2"></i>
                ثبت‌نام رایگان
              </Link>
              <Link href="/courses" className="cta-btn" style={{ 
                background: 'transparent',
                border: '2px solid white',
                color: 'white'
              }}>
                <i className="fas fa-graduation-cap me-2"></i>
                مشاهده دوره‌ها
              </Link>
            </div>
          </div>
    </div>
        
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '250px',
          height: '250px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
      </section>

      <style jsx>{`
        /* Feature Cards */
        .feature-card {
          background: white;
          border-radius: 25px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-icon {
          margin-bottom: 1.5rem;
          color: #667eea;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
        }

        .feature-card h5 {
          color: #1f2937;
          font-weight: 700;
          font-size: 1.3rem;
          margin: 0;
        }

        /* Course Cards */
        .course-card {
          padding: 2.5rem;
          border-radius: 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .course-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.8) 100%);
        }

        .course-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .course-icon {
          margin-bottom: 1.5rem;
          transition: transform 0.3s ease;
        }

        .course-card:hover .course-icon {
          transform: scale(1.15);
        }

        .course-btn {
          display: inline-block;
          width: 100%;
          padding: 14px 30px;
          border-radius: 50px;
          border: none;
          color: white;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .course-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          color: white;
        }

        /* Career Cards */
        .career-card {
          background: white;
          padding: 2.5rem 2rem;
          border-radius: 25px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
        }

        .career-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .career-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          transition: transform 0.3s ease;
        }

        .career-card:hover .career-icon {
          transform: rotate(5deg) scale(1.1);
        }

        .career-card h5 {
          color: #1f2937;
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
        }

        .career-card p {
          color: #6b7280;
          margin: 0;
          font-size: 0.95rem;
        }

        /* Statistics Cards */
        .stat-card {
          padding: 2rem;
        }

        .stat-number {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .stat-label {
          color: #6b7280;
          font-size: 1.1rem;
          font-weight: 600;
        }

        /* CTA Buttons */
        .cta-btn {
          display: inline-block;
          padding: 16px 40px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        }

        /* Enhanced Card Styles */
        .enhanced-card {
          position: relative;
          overflow: hidden;
        }

        .enhanced-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .enhanced-card:hover::before {
          left: 100%;
        }

        .card-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .enhanced-card:hover .card-shine {
          opacity: 1;
        }

        .enhanced-card:hover {
          transform: translateY(-15px) scale(1.05);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }

        .enhanced-card .feature-icon {
          transition: all 0.3s ease;
        }

        .enhanced-card:hover .feature-icon {
          transform: scale(1.2) rotate(5deg);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem !important;
          }

          .stat-number {
            font-size: 2.5rem;
          }

          .feature-card,
          .course-card,
          .career-card {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}