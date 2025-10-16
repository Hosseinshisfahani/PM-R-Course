'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price?: number;
  effective_price: number;
  is_free: boolean;
  thumbnail?: string;
  preview_image?: string;
  difficulty: string;
  duration_hours: number;
  total_sections: number;
  total_videos: number;
  average_rating: number;
  total_reviews: number;
  category: {
    name: string;
    slug: string;
  };
  instructor: {
    name: string;
    bio: string;
    avatar?: string;
  };
  sections: Section[];
  reviews: Review[];
}

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Video {
  id: number;
  title: string;
  description: string;
  duration: number;
  order: number;
  is_preview: boolean;
  video_url?: string;
}

interface Review {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchCourse(params.slug as string);
    }
  }, [params.slug]);

  const fetchCourse = async (slug: string) => {
    try {
      setLoading(true);
      const data = await coursesApi.getCourse(slug);
      setCourse(data);
      if (data.sections && data.sections.length > 0) {
        setActiveSection(data.sections[0].id);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعت ${mins} دقیقه`;
    }
    return `${mins} دقیقه`;
  };

  const handleAddToCart = () => {
    if (course) {
      // Add to cart functionality
      console.log('Add to cart:', course.id);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3">در حال بارگذاری دوره...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
          <h4 className="text-muted">دوره یافت نشد</h4>
          <p className="text-muted">دوره مورد نظر شما یافت نشد یا حذف شده است.</p>
          <Link href="/courses" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>
            بازگشت به لیست دوره‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">خانه</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/courses">دوره‌ها</Link>
            </li>
            {course.category && (
              <li className="breadcrumb-item">
                <Link href={`/courses?category=${course.category.slug}`}>
                  {course.category.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {course.title}
            </li>
          </ol>
        </nav>

        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            {/* Course Header */}
            <div className="card border-0 shadow-sm mb-4" data-aos="fade-up">
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-4">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        className="img-fluid rounded" 
                        alt={course.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <img 
                        src="/static/images/courses_background_medical.jpg" 
                        className="img-fluid rounded" 
                        alt={course.title}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="col-md-8">
                    <h1 className="h3 mb-3">{course.title}</h1>
                    <p className="text-muted mb-3">{course.short_description}</p>
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className={`badge bg-${getDifficultyColor(course.difficulty)}`}>
                        {getDifficultyText(course.difficulty)}
                      </span>
                      {course.category && (
                        <span className="badge bg-primary">{course.category.name}</span>
                      )}
                      {course.discount_price && (
                        <span className="badge bg-danger">تخفیف ویژه</span>
                      )}
                      {course.is_free && (
                        <span className="badge bg-success">رایگان</span>
                      )}
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <div className="rating me-3">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.floor(course.average_rating || 0) ? 'text-warning' : 'text-muted'}`}
                          ></i>
                        ))}
                        <span className="ms-2">({(course.average_rating || 0).toFixed(1)})</span>
                      </div>
                      <small className="text-muted">
                        {course.total_reviews || 0} نظر
                      </small>
                    </div>

                    <div className="row text-center">
                      <div className="col-4">
                        <div className="border-end">
                          <h5 className="text-primary mb-1">{course.total_sections || 0}</h5>
                          <small className="text-muted">بخش</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end">
                          <h5 className="text-success mb-1">{course.total_videos || 0}</h5>
                          <small className="text-muted">ویدیو</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <h5 className="text-warning mb-1">{course.duration_hours || 0}</h5>
                        <small className="text-muted">ساعت</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="card border-0 shadow-sm mb-4" data-aos="fade-up" data-aos-delay="100">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  درباره این دوره
                </h5>
              </div>
              <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: course.description }} />
              </div>
            </div>

            {/* Course Content */}
            <div className="card border-0 shadow-sm mb-4" data-aos="fade-up" data-aos-delay="200">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-list text-primary me-2"></i>
                  محتوای دوره
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="accordion" id="courseAccordion">
                  {course.sections && course.sections.map((section, index) => (
                    <div key={section.id} className="accordion-item">
                      <h2 className="accordion-header">
                        <button 
                          className={`accordion-button ${activeSection === section.id ? '' : 'collapsed'}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#section-${section.id}`}
                          onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <span>
                              <i className="fas fa-play-circle text-primary me-2"></i>
                              {section.title}
                            </span>
                            <small className="text-muted">
                              {section.videos?.length || 0} ویدیو
                            </small>
                          </div>
                        </button>
                      </h2>
                      <div 
                        id={`section-${section.id}`}
                        className={`accordion-collapse collapse ${activeSection === section.id ? 'show' : ''}`}
                        data-bs-parent="#courseAccordion"
                      >
                        <div className="accordion-body">
                          <p className="text-muted mb-3">{section.description}</p>
                          <div className="list-group list-group-flush">
                            {section.videos && section.videos.map((video) => (
                              <div key={video.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  <i className={`fas ${video.is_preview ? 'fa-eye text-success' : 'fa-lock text-muted'} me-3`}></i>
                                  <div>
                                    <h6 className="mb-1">{video.title}</h6>
                                    <small className="text-muted">{video.description}</small>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <small className="text-muted me-3">
                                    {formatDuration(video.duration)}
                                  </small>
                                  {video.is_preview ? (
                                    <span className="badge bg-success">پیش‌نمایش</span>
                                  ) : (
                                    <span className="badge bg-secondary">قفل</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            {course.reviews && course.reviews.length > 0 && (
              <div className="card border-0 shadow-sm" data-aos="fade-up" data-aos-delay="300">
                <div className="card-header bg-transparent border-0">
                  <h5 className="mb-0">
                    <i className="fas fa-star text-warning me-2"></i>
                    نظرات دانشجویان ({course.total_reviews})
                  </h5>
                </div>
                <div className="card-body">
                  {course.reviews.slice(0, showAllReviews ? course.reviews.length : 3).map((review) => (
                    <div key={review.id} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">
                            {review.user.first_name} {review.user.last_name}
                          </h6>
                          <div className="rating">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i} 
                                className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-muted'}`}
                              ></i>
                            ))}
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.created_at).toLocaleDateString('fa-IR')}
                        </small>
                      </div>
                      <p className="mb-0">{review.comment}</p>
                    </div>
                  ))}
                  
                  {course.reviews.length > 3 && (
                    <div className="text-center">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                      >
                        {showAllReviews ? 'نمایش کمتر' : `مشاهده ${course.reviews.length - 3} نظر دیگر`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Purchase Card */}
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }} data-aos="fade-left">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  {course.is_free ? (
                    <h3 className="text-success mb-0">رایگان</h3>
                  ) : (
                    <div>
                      <h3 className="text-primary mb-0">
                        {Math.round(course.effective_price || 0).toLocaleString()} تومان
                      </h3>
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2 mb-4">
                  {course.is_free ? (
                    <button className="btn btn-success btn-lg">
                      <i className="fas fa-play me-2"></i>
                      شروع دوره رایگان
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleAddToCart}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      افزودن به سبد خرید
                    </button>
                  )}
                </div>

                <div className="border-top pt-3">
                  <h6 className="mb-3">این دوره شامل:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      {course.total_videos} ویدیو آموزشی
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      {course.duration_hours} ساعت محتوا
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      دسترسی مادام‌العمر
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      گواهی تکمیل دوره
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      پشتیبانی آنلاین
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            {course.instructor && (
              <div className="card border-0 shadow-sm mt-4" data-aos="fade-left" data-aos-delay="100">
                <div className="card-header bg-transparent border-0">
                  <h6 className="mb-0">
                    <i className="fas fa-chalkboard-teacher text-primary me-2"></i>
                    مدرس دوره
                  </h6>
                </div>
                <div className="card-body text-center">
                  {course.instructor.avatar ? (
                    <img 
                      src={course.instructor.avatar} 
                      className="rounded-circle mb-3" 
                      width="80" 
                      height="80"
                      alt={course.instructor.name}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="fas fa-user fa-2x text-white"></i>
                    </div>
                  )}
                  <h6 className="mb-2">{course.instructor.name}</h6>
                  <p className="text-muted small">{course.instructor.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}