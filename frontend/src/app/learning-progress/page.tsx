'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi } from '@/lib/api';
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
    category: {
      name: string;
      slug: string;
    };
  };
  enrolled_at: string;
  progress_percentage: number;
  last_accessed_at?: string;
  completed_at?: string;
  total_videos_watched: number;
  total_videos: number;
  study_time_minutes: number;
}

interface ProgressStats {
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  total_study_time: number;
  average_progress: number;
  current_streak: number;
  longest_streak: number;
}

export default function LearningProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'title'>('progress');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    } else if (user) {
      fetchProgressData();
    }
  }, [user, authLoading]);

  const fetchProgressData = async () => {
    try {
      const data = await coursesApi.getMyCourses();
      const enrollmentsData = data.enrollments || data || [];
      setEnrollments(enrollmentsData);
      
      // Calculate stats
      const totalCourses = enrollmentsData.length;
      const completedCourses = enrollmentsData.filter(e => e.progress_percentage === 100).length;
      const inProgressCourses = enrollmentsData.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length;
      const totalStudyTime = enrollmentsData.reduce((sum: number, e: Enrollment) => sum + (e.study_time_minutes || 0), 0);
      const averageProgress = enrollmentsData.length > 0 
        ? enrollmentsData.reduce((sum: number, e: Enrollment) => sum + e.progress_percentage, 0) / enrollmentsData.length 
        : 0;

      setStats({
        total_courses: totalCourses,
        completed_courses: completedCourses,
        in_progress_courses: inProgressCourses,
        total_study_time: totalStudyTime,
        average_progress: averageProgress,
        current_streak: 7, // This would come from backend
        longest_streak: 21, // This would come from backend
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
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

  const getFilteredAndSortedEnrollments = () => {
    let filtered = enrollments;
    
    if (filter === 'in-progress') {
      filtered = enrollments.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100);
    } else if (filter === 'completed') {
      filtered = enrollments.filter(e => e.progress_percentage === 100);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress_percentage - a.progress_percentage;
        case 'recent':
          return new Date(b.last_accessed_at || b.enrolled_at).getTime() - new Date(a.last_accessed_at || a.enrolled_at).getTime();
        case 'title':
          return a.course.title.localeCompare(b.course.title, 'fa');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعت و ${mins} دقیقه`;
    }
    return `${mins} دقیقه`;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    if (progress >= 25) return 'primary';
    return 'secondary';
  };

  if (authLoading || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  const filteredEnrollments = getFilteredAndSortedEnrollments();

  return (
    <>
      <style jsx>{`
        .progress-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem 0;
        }
        
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .stat-item {
          text-align: center;
          padding: 1rem;
          border-radius: 15px;
          background: rgba(99, 102, 241, 0.1);
          transition: all 0.3s ease;
        }
        
        .stat-item:hover {
          transform: translateY(-5px);
          background: rgba(99, 102, 241, 0.2);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: var(--text-light);
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .progress-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }
        
        .progress-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .course-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 15px;
          object-fit: cover;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .progress-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          color: white;
        }
        
        .filter-tabs {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 0.5rem;
          margin-bottom: 2rem;
        }
        
        .filter-tab {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .filter-tab.active {
          background: white;
          color: var(--primary-color);
        }
        
        .sort-dropdown {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }
      `}</style>

      <div className="progress-page">
        <div className="container">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="text-white mb-2">
                    <i className="fas fa-chart-line me-3"></i>
                    پیشرفت یادگیری
                  </h1>
                  <p className="text-white-50 mb-0">
                    آمار و پیشرفت شما در دوره‌های مختلف
                  </p>
                </div>
                <Link href="/profile" className="btn btn-light">
                  <i className="fas fa-arrow-right me-2"></i>
                  بازگشت به پروفایل
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="stats-card" data-aos="fade-up">
              <h3 className="mb-4 text-center">
                <i className="fas fa-chart-bar me-2 text-primary"></i>
                آمار کلی
              </h3>
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number">{stats.total_courses}</div>
                    <div className="stat-label">کل دوره‌ها</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-success">{stats.completed_courses}</div>
                    <div className="stat-label">تکمیل شده</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-warning">{stats.in_progress_courses}</div>
                    <div className="stat-label">در حال یادگیری</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-info">{Math.round(stats.average_progress)}%</div>
                    <div className="stat-label">میانگین پیشرفت</div>
                  </div>
                </div>
              </div>
              
              <div className="row g-4 mt-3">
                <div className="col-md-4">
                  <div className="stat-item">
                    <div className="stat-number text-primary">{formatStudyTime(stats.total_study_time)}</div>
                    <div className="stat-label">کل زمان مطالعه</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-item">
                    <div className="stat-number text-success">{stats.current_streak}</div>
                    <div className="stat-label">روز متوالی فعلی</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-item">
                    <div className="stat-number text-warning">{stats.longest_streak}</div>
                    <div className="stat-label">بیشترین روز متوالی</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Sort */}
          <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up" data-aos-delay="100">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                همه دوره‌ها
              </button>
              <button 
                className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setFilter('in-progress')}
              >
                در حال یادگیری
              </button>
              <button 
                className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                تکمیل شده
              </button>
            </div>
            
            <select 
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="progress">مرتب‌سازی بر اساس پیشرفت</option>
              <option value="recent">مرتب‌سازی بر اساس آخرین فعالیت</option>
              <option value="title">مرتب‌سازی بر اساس نام</option>
            </select>
          </div>

          {/* Courses List */}
          <div className="row">
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enrollment, index) => (
                <div key={enrollment.id} className="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="progress-card">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        {enrollment.course.thumbnail ? (
                          <Image
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            width={80}
                            height={80}
                            className="course-thumbnail"
                          />
                        ) : (
                          <div className="course-thumbnail bg-primary d-flex align-items-center justify-content-center text-white">
                            <i className="fas fa-graduation-cap fa-2x"></i>
                          </div>
                        )}
                      </div>
                      
                      <div className="col">
                        <h5 className="mb-2">{enrollment.course.title}</h5>
                        <p className="text-muted small mb-2">{enrollment.course.short_description}</p>
                        
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <span className={`badge bg-${getDifficultyColor(enrollment.course.difficulty)}`}>
                            {getDifficultyText(enrollment.course.difficulty)}
                          </span>
                          <span className="badge bg-light text-dark">
                            {enrollment.course.duration_hours} ساعت
                          </span>
                          <span className="badge bg-light text-dark">
                            {enrollment.course.category.name}
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <i className="fas fa-play me-1"></i>
                            {enrollment.total_videos_watched || 0} از {enrollment.total_videos || 0} ویدیو
                          </span>
                          {enrollment.study_time_minutes > 0 && (
                            <span>
                              <i className="fas fa-clock me-1"></i>
                              {formatStudyTime(enrollment.study_time_minutes)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-auto">
                        <div 
                          className={`progress-circle bg-${getProgressColor(enrollment.progress_percentage)}`}
                          style={{
                            background: `conic-gradient(var(--bs-${getProgressColor(enrollment.progress_percentage)}) ${enrollment.progress_percentage * 3.6}deg, #e9ecef 0deg)`
                          }}
                        >
                          {enrollment.progress_percentage}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">پیشرفت دوره</small>
                        <small className="fw-bold text-primary">{enrollment.progress_percentage}%</small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar bg-${getProgressColor(enrollment.progress_percentage)}`}
                          role="progressbar" 
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Last Accessed */}
                    {enrollment.last_accessed_at && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="fas fa-history me-1"></i>
                          آخرین فعالیت: {new Date(enrollment.last_accessed_at).toLocaleDateString('fa-IR')}
                        </small>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="d-grid gap-2 mt-3">
                      <Link 
                        href={`/courses/${enrollment.course.slug}`} 
                        className="btn btn-primary"
                      >
                        <i className="fas fa-play me-2"></i>
                        {enrollment.progress_percentage === 100 ? 'مرور دوره' : 'ادامه یادگیری'}
                      </Link>
                      {enrollment.progress_percentage === 100 && (
                        <Link 
                          href={`/courses/${enrollment.course.slug}/certificate`} 
                          className="btn btn-outline-success btn-sm"
                        >
                          <i className="fas fa-certificate me-2"></i>
                          مشاهده گواهی
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <i className="fas fa-graduation-cap fa-4x text-muted mb-3"></i>
                  <h4 className="text-muted">هنوز دوره‌ای ثبت‌نام نکرده‌اید</h4>
                  <p className="text-muted">برای شروع یادگیری، ابتدا در یکی از دوره‌های ما ثبت‌نام کنید</p>
                  <Link href="/courses" className="btn btn-primary">
                    <i className="fas fa-search me-2"></i>
                    مشاهده دوره‌ها
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
