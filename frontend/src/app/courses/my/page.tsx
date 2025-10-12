'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    thumbnail?: string;
    difficulty: string;
    duration_hours: number;
    price: number;
  };
  enrolled_at: string;
  progress_percentage: number;
  last_accessed_at?: string;
}

export default function MyCoursesPage() {
  const { user, loading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/my-courses/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success';
      case 'intermediate':
        return 'bg-warning';
      case 'advanced':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدی';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'پیشرفته';
      default:
        return difficulty;
    }
  };

  if (loading || isLoading) {
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
              <p>برای مشاهده دوره‌های خود، ابتدا وارد حساب کاربری شوید.</p>
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
        .course-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .course-thumbnail {
          object-fit: cover;
          height: 200px;
        }
        
        .progress-bar {
          height: 8px;
          border-radius: 4px;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .empty-state-icon {
          font-size: 4rem;
          color: #6c757d;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="container mt-4">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="fw-bold">دوره‌های من</h1>
            <p className="text-muted">دوره‌هایی که در آن‌ها ثبت‌نام کرده‌اید</p>
          </div>
        </div>
        
        {/* My Courses */}
        {enrollments.length > 0 ? (
          <div className="row">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="col-lg-6 col-md-12 mb-4" data-aos="fade-up">
                <div className="card h-100 course-card">
                  <div className="row g-0">
                    <div className="col-md-4">
                      {enrollment.course.thumbnail ? (
                        <Image
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          width={200}
                          height={150}
                          className="img-fluid rounded-start course-thumbnail"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="img-fluid rounded-start course-thumbnail d-flex align-items-center justify-content-center bg-light"
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {enrollment.course.title}
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <div className="card-body d-flex flex-column h-100">
                        <h5 className="card-title">{enrollment.course.title}</h5>
                        <p className="card-text text-muted">
                          {enrollment.course.short_description.length > 100 
                            ? `${enrollment.course.short_description.substring(0, 100)}...`
                            : enrollment.course.short_description
                          }
                        </p>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <span className={`badge ${getDifficultyBadgeClass(enrollment.course.difficulty)}`}>
                                {getDifficultyText(enrollment.course.difficulty)}
                              </span>
                              <span className="text-muted ms-2">{enrollment.course.duration_hours} ساعت</span>
                            </div>
                            <small className="text-muted">
                              {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}
                            </small>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">پیشرفت</small>
                              <small className="text-muted">{enrollment.progress_percentage}%</small>
                            </div>
                            <div className="progress">
                              <div 
                                className="progress-bar bg-primary progress-bar" 
                                role="progressbar" 
                                style={{ width: `${enrollment.progress_percentage}%` }}
                                aria-valuenow={enrollment.progress_percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="d-grid gap-2">
                            <Link 
                              href={`/courses/${enrollment.course.slug}`} 
                              className="btn btn-outline-primary"
                            >
                              <i className="fas fa-play me-2"></i>
                              ادامه یادگیری
                            </Link>
                            <Link 
                              href={`/courses/${enrollment.course.slug}/certificate`} 
                              className="btn btn-outline-success btn-sm"
                            >
                              <i className="fas fa-certificate me-2"></i>
                              گواهی تکمیل
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="text-muted">هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید</h3>
            <p className="text-muted mb-4">
              برای شروع یادگیری، از دوره‌های موجود دیدن کنید و در دوره‌های مورد علاقه خود ثبت‌نام کنید.
            </p>
            <Link href="/courses" className="btn btn-primary btn-lg">
              <i className="fas fa-search me-2"></i>
              مشاهده دوره‌ها
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
