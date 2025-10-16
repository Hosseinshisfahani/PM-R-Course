'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  effective_price: number;
  is_free: boolean;
  thumbnail?: string;
  difficulty: string;
  duration_hours: number;
  total_sections: number;
  total_videos: number;
  average_rating: number;
  category: {
    name: string;
    slug: string;
  };
}

interface CoursePackage {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  original_price: number;
  package_price: number;
  discount_percentage: number;
  total_courses: number;
  total_duration: number;
  savings_amount: number;
  is_published: boolean;
  is_featured: boolean;
  thumbnail?: string;
  courses: Course[];
  created_at: string;
  updated_at: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3">در حال بارگذاری پکیج‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 courses-background-light">
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5" data-aos="fade-up">
          <h1 className="section-title">پکیج‌های ویژه</h1>
          <p className="section-subtitle">دوره‌های کامل با تخفیف ویژه</p>
        </div>

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="row justify-content-center">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="col-12 col-lg-10 col-xl-8 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="package-card h-100">
                  <div className="package-header">
                    <div className="package-badge">
                      <i className="fas fa-gift me-2"></i>
                      پکیج ویژه
                    </div>
                    <div className="package-discount">
                      {pkg.discount_percentage}% تخفیف
                    </div>
                  </div>
                  
                  <div className="package-content">
                    <h3 className="package-title">{pkg.title}</h3>
                    <p className="package-description">{pkg.short_description}</p>
                    
                    <div className="package-courses">
                      <h6 className="mb-3">
                        <i className="fas fa-book me-2"></i>
                        شامل {pkg.total_courses} دوره:
                      </h6>
                      <ul className="package-course-list">
                        {pkg.courses.map((course) => (
                          <li key={course.id} className="d-flex align-items-center">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            <span>{course.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="package-stats">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="stat-number">{pkg.total_courses}</div>
                            <div className="stat-label">دوره</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="stat-number">{pkg.total_duration}</div>
                            <div className="stat-label">ساعت</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="stat-item">
                            <div className="stat-number">{Math.round(pkg.savings_amount).toLocaleString()}</div>
                            <div className="stat-label">صرفه‌جویی</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="package-pricing">
                      <div className="price-row">
                        <div className="original-price">
                          <span className="text-muted text-decoration-line-through">
                            {Math.round(pkg.original_price).toLocaleString()} تومان
                          </span>
                        </div>
                        <div className="package-price">
                          <span className="price-amount">{Math.round(pkg.package_price).toLocaleString()}</span>
                          <span className="price-currency">تومان</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="package-actions">
                      <Link href={`/packages/${pkg.slug}`} className="btn btn-primary btn-lg w-100">
                        <i className="fas fa-shopping-cart me-2"></i>
                        خرید پکیج
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5" data-aos="fade-up">
            <i className="fas fa-gift fa-4x text-muted mb-3"></i>
            <h4 className="text-muted">هیچ پکیجی یافت نشد</h4>
            <p className="text-muted">
              در حال حاضر هیچ پکیج ویژه‌ای موجود نیست. به زودی پکیج‌های جدید اضافه خواهد شد.
            </p>
            <Link href="/courses" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>
              مشاهده دوره‌ها
            </Link>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-5" data-aos="fade-up">
          <Link href="/" className="btn btn-outline-primary">
            <i className="fas fa-home me-2"></i>
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>

      <style jsx>{`
        .courses-background-light {
          background-image: url('/static/images/courses_background.jpg') !important;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          position: relative;
        }
        
        .courses-background-light::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          z-index: 1;
        }
        
        .container {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
