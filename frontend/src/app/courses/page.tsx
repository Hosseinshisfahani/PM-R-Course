'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { coursesApi } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  price: number;
  discount_price?: number;
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    fetchCourses(query);
    fetchPackages();
  }, [searchParams]);

  const fetchCourses = async (query: string = '') => {
    try {
      setLoading(true);
      const data = query 
        ? await coursesApi.searchCourses(query)
        : await coursesApi.getCourses();
      setCourses(data.results || data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await coursesApi.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = searchQuery ? `/courses?q=${encodeURIComponent(searchQuery)}` : '/courses';
    window.location.href = url;
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
          <p className="mt-3">در حال بارگذاری دوره‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 courses-background-light">
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5" data-aos="fade-up">
          <h1 className="section-title">دوره‌های آموزشی</h1>
          <p className="section-subtitle">بهترین دوره‌های آموزشی پزشکی را کشف کنید</p>
        </div>

        {/* Search Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6">
            <form onSubmit={handleSearch} className="search-container">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="جستجو در دوره‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '25px 0 0 25px' }}
                />
                <button className="btn btn-primary" type="submit" style={{ borderRadius: '0 25px 25px 0' }}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Info */}
        {searchQuery && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-info">
                <i className="fas fa-search me-2"></i>
                نتایج جستجو برای: <strong>"{searchQuery}"</strong>
                <span className="ms-2">({courses.length} دوره یافت شد)</span>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="row">
            {courses.map((course, index) => (
              <div key={course.id} className="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="course-card h-100">
                  <div className="position-relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        className="card-img-top" 
                        alt={course.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <img 
                        src="/static/images/courses_background_medical.jpg" 
                        className="card-img-top" 
                        alt={course.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className={`badge bg-${getDifficultyColor(course.difficulty)}`}>
                        {getDifficultyText(course.difficulty)}
                      </span>
                    </div>
                    {course.discount_price && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-danger">تخفیف ویژه</span>
                      </div>
                    )}
                    {course.is_free && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-success">رایگان</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-body d-flex flex-column">
                    <h5 className="course-title">{course.title}</h5>
                    <p className="course-description">{course.short_description}</p>
                    
                    <div className="d-flex justify-content-center align-items-center mb-3">
                      <div className="rating me-3">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.floor(course.average_rating || 0) ? 'text-warning' : 'text-muted'}`}
                          ></i>
                        ))}
                        <small className="text-muted ms-1">({(course.average_rating || 0).toFixed(1)})</small>
                      </div>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        {course.duration_hours || 0} ساعت
                      </small>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        {course.is_free ? (
                          <span className="text-success fw-bold">رایگان</span>
                        ) : (
                          <span className="price-display">
                            {Math.round(course.effective_price || 0).toLocaleString()} تومان
                          </span>
                        )}
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">{course.total_sections || 0} بخش</small>
                        <small className="text-muted">{course.total_videos || 0} ویدیو</small>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-grid gap-2">
                        <Link 
                          href={`/courses/${course.slug}`} 
                          className="btn btn-primary"
                          style={{ 
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                            border: 'none', 
                            borderRadius: '50px', 
                            fontWeight: '600' 
                          }}
                        >
                          <i className="fas fa-eye me-2"></i>
                          مشاهده دوره
                        </Link>
                        {!course.is_free && (
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => {
                              // Add to cart functionality
                              console.log('Add to cart:', course.id);
                            }}
                          >
                            <i className="fas fa-cart-plus me-1"></i>
                            افزودن به سبد خرید
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5" data-aos="fade-up">
            <i className="fas fa-search fa-4x text-muted mb-3"></i>
            <h4 className="text-muted">هیچ دوره‌ای یافت نشد</h4>
            <p className="text-muted">
              {searchQuery 
                ? `برای عبارت "${searchQuery}" هیچ دوره‌ای یافت نشد. لطفاً عبارت دیگری را امتحان کنید.`
                : 'در حال حاضر هیچ دوره‌ای موجود نیست. به زودی دوره‌های جدید اضافه خواهد شد.'
              }
            </p>
            {searchQuery && (
              <Link href="/courses" className="btn btn-primary">
                <i className="fas fa-arrow-left me-2"></i>
                مشاهده همه دوره‌ها
              </Link>
            )}
          </div>
        )}

        {/* Packages Section */}
        {!searchQuery && packages.length > 0 && (
          <div className="mt-5 package-section" data-aos="fade-up">
            <div className="package-container">
              <div className="text-center mb-4">
                <h2 className="section-title">پکیج‌های ویژه</h2>
                <p className="section-subtitle">دوره‌های کامل با تخفیف ویژه</p>
              </div>
              
              <div className="row justify-content-center">
                {packages.map((pkg, index) => (
                  <div key={pkg.id} className="col-12 col-lg-10 col-xl-9 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
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
            </div>
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
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-attachment: scroll !important;
          position: relative !important;
          min-height: 80vh !important;
        }

        .courses-background-light::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          z-index: 1;
        }

        .courses-background-light > * {
          position: relative;
          z-index: 2;
        }

        .search-container .form-control {
          padding-right: 50px;
          border-radius: 25px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .search-container .form-control:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
        }
      `}</style>
    </div>
  );
}