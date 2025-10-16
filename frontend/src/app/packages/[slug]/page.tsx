'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function PackageDetailPage() {
  const params = useParams();
  const [packageData, setPackageData] = useState<CoursePackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPackage(params.slug as string);
    }
  }, [params.slug]);

  const fetchPackage = async (slug: string) => {
    try {
      setLoading(true);
      const data = await coursesApi.getPackage(slug);
      setPackageData(data);
    } catch (error) {
      console.error('Error fetching package:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'مبتدی';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'پیشرفته';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3">در حال بارگذاری پکیج...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h1 className="display-4 text-muted">پکیج یافت نشد</h1>
          <p className="lead">پکیج مورد نظر یافت نشد یا حذف شده است.</p>
          <Link href="/courses" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>
            بازگشت به دوره‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 courses-background-light">
      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">خانه</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/courses">دوره‌ها</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {packageData.title}
            </li>
          </ol>
        </nav>

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="package-detail-card mb-4" data-aos="fade-up">
              <div className="package-header">
                <div className="package-badge">
                  <i className="fas fa-gift me-2"></i>
                  پکیج ویژه
                </div>
                <div className="package-discount">
                  {packageData.discount_percentage}% تخفیف
                </div>
              </div>
              
              <div className="package-content">
                <h1 className="package-title">{packageData.title}</h1>
                <p className="package-description">{packageData.short_description}</p>
                
                <div className="package-stats mb-4">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">{packageData.total_courses}</div>
                        <div className="stat-label">دوره</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">{packageData.total_duration}</div>
                        <div className="stat-label">ساعت</div>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <div className="stat-number">{Math.round(packageData.savings_amount).toLocaleString()}</div>
                        <div className="stat-label">صرفه‌جویی</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="package-pricing mb-4">
                  <div className="price-row">
                    <div className="original-price">
                      <span className="text-muted text-decoration-line-through">
                        {Math.round(packageData.original_price).toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="package-price">
                      <span className="price-amount">{Math.round(packageData.package_price).toLocaleString()}</span>
                      <span className="price-currency">تومان</span>
                    </div>
                  </div>
                </div>

                <div className="package-actions mb-4">
                  <button className="btn btn-primary btn-lg w-100">
                    <i className="fas fa-shopping-cart me-2"></i>
                    خرید پکیج
                  </button>
                </div>
              </div>
            </div>

            {/* Package Description */}
            <div className="card mb-4" data-aos="fade-up">
              <div className="card-body">
                <h3 className="card-title">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  درباره این پکیج
                </h3>
                <div 
                  className="package-full-description"
                  dangerouslySetInnerHTML={{ __html: packageData.description }}
                />
              </div>
            </div>

            {/* Included Courses */}
            <div className="card" data-aos="fade-up">
              <div className="card-body">
                <h3 className="card-title">
                  <i className="fas fa-book me-2 text-primary"></i>
                  دوره‌های شامل شده
                </h3>
                <div className="row">
                  {packageData.courses.map((course, index) => (
                    <div key={course.id} className="col-md-6 mb-3">
                      <div className="course-item-card">
                        <div className="d-flex align-items-center">
                          <div className="course-icon me-3">
                            <i className="fas fa-play-circle text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="course-title mb-1">{course.title}</h6>
                            <div className="course-meta">
                              <span className={`badge bg-${getDifficultyColor(course.difficulty)} me-2`}>
                                {getDifficultyText(course.difficulty)}
                              </span>
                              <span className="text-muted">
                                <i className="fas fa-clock me-1"></i>
                                {course.duration_hours} ساعت
                              </span>
                            </div>
                            <div className="course-price">
                              <span className="text-primary fw-bold">
                                {Math.round(course.effective_price).toLocaleString()} تومان
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Package Summary */}
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }} data-aos="fade-left">
              <div className="card-body p-4">
                <h4 className="card-title text-center mb-4">خلاصه پکیج</h4>
                
                <div className="package-summary">
                  <div className="summary-item">
                    <i className="fas fa-gift text-primary me-2"></i>
                    <span>پکیج ویژه</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-book text-primary me-2"></i>
                    <span>{packageData.total_courses} دوره</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-clock text-primary me-2"></i>
                    <span>{packageData.total_duration} ساعت محتوا</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-infinity text-primary me-2"></i>
                    <span>دسترسی مادام‌العمر</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-certificate text-primary me-2"></i>
                    <span>گواهی تکمیل دوره</span>
                  </div>
                  <div className="summary-item">
                    <i className="fas fa-headset text-primary me-2"></i>
                    <span>پشتیبانی آنلاین</span>
                  </div>
                </div>

                <div className="package-pricing-summary mt-4">
                  <div className="price-breakdown">
                    <div className="d-flex justify-content-between mb-2">
                      <span>قیمت کل دوره‌ها:</span>
                      <span className="text-muted text-decoration-line-through">
                        {Math.round(packageData.original_price).toLocaleString()} تومان
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>تخفیف ({packageData.discount_percentage}%):</span>
                      <span className="text-success">
                        -{Math.round(packageData.savings_amount).toLocaleString()} تومان
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">قیمت نهایی:</span>
                      <span className="fw-bold text-primary fs-5">
                        {Math.round(packageData.package_price).toLocaleString()} تومان
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button className="btn btn-primary btn-lg">
                    <i className="fas fa-shopping-cart me-2"></i>
                    خرید پکیج
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="fas fa-heart me-2"></i>
                    افزودن به علاقه‌مندی‌ها
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        .package-detail-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          color: white;
        }

        .package-header {
          position: relative;
          padding: 20px 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .package-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .package-discount {
          background: #ff6b6b;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }

        .package-content {
          padding: 20px;
        }

        .package-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: white;
          text-align: center;
        }

        .package-description {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 25px;
          line-height: 1.6;
          text-align: center;
          font-size: 1.2rem;
        }

        .package-stats {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .package-pricing {
          text-align: center;
        }

        .price-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .original-price {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
        }

        .package-price {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .price-amount {
          font-size: 3.5rem;
          font-weight: 800;
          color: white;
        }

        .price-currency {
          font-size: 1.8rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .package-actions .btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          padding: 15px 30px;
          border-radius: 15px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .package-actions .btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          color: white;
          transform: translateY(-2px);
        }

        .package-full-description {
          line-height: 1.8;
        }

        .package-full-description h2,
        .package-full-description h3 {
          color: #333;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .package-full-description ul {
          padding-right: 1.5rem;
        }

        .package-full-description li {
          margin-bottom: 0.5rem;
        }

        .course-item-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .course-item-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .course-icon {
          font-size: 1.5rem;
        }

        .course-title {
          color: #333;
          font-weight: 600;
        }

        .course-meta {
          margin-bottom: 8px;
        }

        .course-price {
          font-size: 0.9rem;
        }

        .package-summary {
          margin-bottom: 20px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .package-pricing-summary {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
        }

        .price-breakdown {
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .package-title {
            font-size: 2rem;
          }
          
          .price-amount {
            font-size: 3rem;
          }
          
          .package-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
