'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  thumbnail?: string;
  difficulty: string;
  duration_hours: number;
  price: number;
  category: {
    name: string;
    slug: string;
  };
}

interface Enrollment {
  id: number;
  course: Course;
  enrolled_at: string;
  progress_percentage?: number;
  last_accessed_at?: string;
}

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMyCourses();
    }
  }, [user, authLoading, router]);

  const fetchMyCourses = async () => {
    try {
      const data = await coursesApi.getMyCourses();
      setEnrollments(data.enrollments || data || []);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setIsLoading(false);
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

  const getFilteredEnrollments = () => {
    if (filter === 'in-progress') {
      return enrollments.filter(e => (e.progress_percentage || 0) > 0 && (e.progress_percentage || 0) < 100);
    }
    if (filter === 'completed') {
      return enrollments.filter(e => (e.progress_percentage || 0) === 100);
    }
    return enrollments;
  };

  const filteredEnrollments = getFilteredEnrollments();

  if (authLoading || isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3 text-muted">در حال بارگذاری دوره‌های شما...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="my-courses-page py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                  <div>
                    <h1 className="display-5 fw-bold mb-2">دوره‌های من</h1>
                    <p className="lead mb-0">به یادگیری خود ادامه دهید و مهارت‌های جدید کسب کنید</p>
                  </div>
                  <div className="mt-3 mt-md-0">
                    <Link href="/courses" className="btn btn-light btn-lg">
                      <i className="fas fa-search me-2"></i>
                      جستجوی دوره‌ها
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-graduation-cap fa-2x text-primary"></i>
                </div>
                <h3 className="fw-bold mb-1">{enrollments.length}</h3>
                <p className="text-muted mb-0">دوره ثبت‌نام شده</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
                <h3 className="fw-bold mb-1">
                  {enrollments.filter(e => (e.progress_percentage || 0) > 0 && (e.progress_percentage || 0) < 100).length}
                </h3>
                <p className="text-muted mb-0">در حال یادگیری</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '70px', height: '70px' }}>
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <h3 className="fw-bold mb-1">
                  {enrollments.filter(e => (e.progress_percentage || 0) === 100).length}
                </h3>
                <p className="text-muted mb-0">تکمیل شده</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4">
          <ul className="nav nav-pills justify-content-center bg-white rounded shadow-sm p-2">
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <i className="fas fa-th-large me-2"></i>
                همه ({enrollments.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setFilter('in-progress')}
              >
                <i className="fas fa-spinner me-2"></i>
                در حال یادگیری ({enrollments.filter(e => (e.progress_percentage || 0) > 0 && (e.progress_percentage || 0) < 100).length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                <i className="fas fa-check me-2"></i>
                تکمیل شده ({enrollments.filter(e => (e.progress_percentage || 0) === 100).length})
              </button>
            </li>
          </ul>
        </div>

        {/* Courses Grid */}
        {filteredEnrollments.length > 0 ? (
          <div className="row g-4">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="col-lg-6 col-xl-4" data-aos="fade-up">
                <div className="card border-0 shadow-sm h-100 course-card">
                  <div className="position-relative">
                    {enrollment.course.thumbnail ? (
                      <img 
                        src={enrollment.course.thumbnail} 
                        className="card-img-top" 
                        alt={enrollment.course.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="card-img-top d-flex align-items-center justify-content-center"
                        style={{
                          height: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white'
                        }}
                      >
                        <i className="fas fa-graduation-cap fa-3x"></i>
                      </div>
                    )}
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className={`badge bg-${getDifficultyColor(enrollment.course.difficulty)}`}>
                        {getDifficultyText(enrollment.course.difficulty)}
                      </span>
                    </div>
                    {(enrollment.progress_percentage || 0) === 100 && (
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>
                          تکمیل شده
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      {enrollment.course.category && (
                        <span className="badge bg-light text-dark">
                          <i className="fas fa-folder me-1"></i>
                          {enrollment.course.category.name}
                        </span>
                      )}
                    </div>
                    <h5 className="card-title mb-2">{enrollment.course.title}</h5>
                    <p className="card-text text-muted small mb-3">
                      {enrollment.course.short_description?.length > 100 
                        ? `${enrollment.course.short_description.substring(0, 100)}...`
                        : enrollment.course.short_description
                      }
                    </p>

                    <div className="mt-auto">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <small className="text-muted">پیشرفت دوره</small>
                          <small className="fw-bold text-primary">{enrollment.progress_percentage || 0}%</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 align-items-center text-muted small mb-3">
                        <i className="fas fa-clock"></i>
                        <span>{enrollment.course.duration_hours || 0} ساعت</span>
                        <span className="mx-2">•</span>
                        <i className="fas fa-calendar-alt"></i>
                        <span>
                          {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>

                      <div className="d-grid gap-2">
                        <Link 
                          href={`/courses/${enrollment.course.slug}`} 
                          className="btn btn-primary"
                        >
                          <i className="fas fa-play-circle me-2"></i>
                          {(enrollment.progress_percentage || 0) === 0 ? 'شروع دوره' : 'ادامه یادگیری'}
                        </Link>
                        {(enrollment.progress_percentage || 0) === 100 && (
                          <button className="btn btn-outline-success">
                            <i className="fas fa-certificate me-2"></i>
                            دریافت گواهی
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
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-graduation-cap text-muted" style={{ fontSize: '5rem' }}></i>
            </div>
            <h3 className="mb-3">
              {filter === 'all' && 'هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید'}
              {filter === 'in-progress' && 'دوره‌ای در حال یادگیری ندارید'}
              {filter === 'completed' && 'هنوز دوره‌ای را تکمیل نکرده‌اید'}
            </h3>
            <p className="text-muted mb-4 lead">
              برای شروع یادگیری، از دوره‌های موجود بازدید کنید
            </p>
            <Link href="/courses" className="btn btn-primary btn-lg">
              <i className="fas fa-search me-2"></i>
              مشاهده همه دوره‌ها
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .course-card {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
        }

        .nav-pills .nav-link {
          color: #6c757d;
          border-radius: 0.5rem;
          padding: 0.75rem 1.5rem;
          margin: 0 0.25rem;
        }

        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .nav-pills .nav-link:hover:not(.active) {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

