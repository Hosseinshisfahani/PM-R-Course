'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface Certificate {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    thumbnail?: string;
    difficulty: string;
    duration_hours: number;
    category: {
      name: string;
      slug: string;
    };
  };
  completed_at: string;
  certificate_url?: string;
  certificate_id: string;
  grade?: number;
  completion_percentage: number;
}

interface CertificateStats {
  total_certificates: number;
  recent_certificates: number;
  average_grade: number;
  total_study_hours: number;
}

export default function CertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'excellent'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'course' | 'grade'>('date');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    } else if (user) {
      fetchCertificates();
    }
  }, [user, authLoading]);

  const fetchCertificates = async () => {
    try {
      // Fetch completed courses (100% progress)
      const data = await coursesApi.getMyCourses();
      const enrollments = data.enrollments || data || [];
      
      // Filter only completed courses and create certificate objects
      const completedCourses = enrollments.filter((enrollment: any) => enrollment.progress_percentage === 100);
      
      const certificatesData: Certificate[] = completedCourses.map((enrollment: any) => ({
        id: enrollment.id,
        course: enrollment.course,
        completed_at: enrollment.completed_at || enrollment.last_accessed_at || new Date().toISOString(),
        certificate_url: `/courses/${enrollment.course.slug}/certificate`,
        certificate_id: `CERT-${enrollment.id}-${enrollment.course.id}`,
        grade: Math.floor(Math.random() * 20) + 80, // Mock grade between 80-100
        completion_percentage: enrollment.progress_percentage
      }));
      
      setCertificates(certificatesData);
      
      // Calculate stats
      const totalCertificates = certificatesData.length;
      const recentCertificates = certificatesData.filter(cert => {
        const completionDate = new Date(cert.completed_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return completionDate >= thirtyDaysAgo;
      }).length;
      
      const averageGrade = certificatesData.length > 0 
        ? certificatesData.reduce((sum, cert) => sum + (cert.grade || 0), 0) / certificatesData.length 
        : 0;
      
      const totalStudyHours = certificatesData.reduce((sum, cert) => sum + cert.course.duration_hours, 0);

      setStats({
        total_certificates: totalCertificates,
        recent_certificates: recentCertificates,
        average_grade: averageGrade,
        total_study_hours: totalStudyHours
      });
    } catch (error) {
      console.error('Error fetching certificates:', error);
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

  const getGradeColor = (grade: number) => {
    if (grade >= 95) return 'success';
    if (grade >= 85) return 'info';
    if (grade >= 75) return 'warning';
    return 'danger';
  };

  const getGradeText = (grade: number) => {
    if (grade >= 95) return 'عالی';
    if (grade >= 85) return 'خیلی خوب';
    if (grade >= 75) return 'خوب';
    return 'قابل قبول';
  };

  const getFilteredAndSortedCertificates = () => {
    let filtered = certificates;
    
    if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = certificates.filter(cert => new Date(cert.completed_at) >= thirtyDaysAgo);
    } else if (filter === 'excellent') {
      filtered = certificates.filter(cert => (cert.grade || 0) >= 90);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        case 'course':
          return a.course.title.localeCompare(b.course.title, 'fa');
        case 'grade':
          return (b.grade || 0) - (a.grade || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadCertificate = (certificate: Certificate) => {
    // This would typically open the certificate in a new tab or download it
    window.open(certificate.certificate_url, '_blank');
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

  const filteredCertificates = getFilteredAndSortedCertificates();

  return (
    <>
      <style jsx>{`
        .certificates-page {
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
        
        .certificate-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        
        .certificate-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .certificate-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .course-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 15px;
          object-fit: cover;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .grade-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
        }
        
        .certificate-icon {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
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
        
        .certificate-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .btn-certificate {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-download {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
        }
        
        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
          color: white;
        }
        
        .btn-view {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          color: white;
        }
        
        .btn-view:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
          color: white;
        }
      `}</style>

      <div className="certificates-page">
        <div className="container">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="text-white mb-2">
                    <i className="fas fa-certificate me-3"></i>
                    گواهی‌نامه‌ها
                  </h1>
                  <p className="text-white-50 mb-0">
                    گواهی‌های تکمیل دوره‌های شما
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
                <i className="fas fa-trophy me-2 text-primary"></i>
                آمار گواهی‌ها
              </h3>
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number">{stats.total_certificates}</div>
                    <div className="stat-label">کل گواهی‌ها</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-success">{stats.recent_certificates}</div>
                    <div className="stat-label">گواهی‌های اخیر</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-info">{Math.round(stats.average_grade)}</div>
                    <div className="stat-label">میانگین نمره</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stat-item">
                    <div className="stat-number text-warning">{stats.total_study_hours}</div>
                    <div className="stat-label">ساعت مطالعه</div>
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
                همه گواهی‌ها
              </button>
              <button 
                className={`filter-tab ${filter === 'recent' ? 'active' : ''}`}
                onClick={() => setFilter('recent')}
              >
                اخیر
              </button>
              <button 
                className={`filter-tab ${filter === 'excellent' ? 'active' : ''}`}
                onClick={() => setFilter('excellent')}
              >
                عالی
              </button>
            </div>
            
            <select 
              className="sort-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">مرتب‌سازی بر اساس تاریخ</option>
              <option value="course">مرتب‌سازی بر اساس نام دوره</option>
              <option value="grade">مرتب‌سازی بر اساس نمره</option>
            </select>
          </div>

          {/* Certificates List */}
          <div className="row">
            {filteredCertificates.length > 0 ? (
              filteredCertificates.map((certificate, index) => (
                <div key={certificate.id} className="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="certificate-card">
                    <div className="certificate-icon">
                      <i className="fas fa-certificate"></i>
                    </div>
                    
                    <div className={`grade-badge bg-${getGradeColor(certificate.grade || 0)} text-white`}>
                      {certificate.grade} - {getGradeText(certificate.grade || 0)}
                    </div>
                    
                    <div className="row align-items-center">
                      <div className="col-auto">
                        {certificate.course.thumbnail ? (
                          <Image
                            src={certificate.course.thumbnail}
                            alt={certificate.course.title}
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
                        <h5 className="mb-2">{certificate.course.title}</h5>
                        <p className="text-muted small mb-2">{certificate.course.short_description}</p>
                        
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <span className={`badge bg-${getDifficultyColor(certificate.course.difficulty)}`}>
                            {getDifficultyText(certificate.course.difficulty)}
                          </span>
                          <span className="badge bg-light text-dark">
                            {certificate.course.duration_hours} ساعت
                          </span>
                          <span className="badge bg-light text-dark">
                            {certificate.course.category.name}
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <i className="fas fa-calendar me-1"></i>
                            تکمیل شده در: {formatDate(certificate.completed_at)}
                          </span>
                          <span>
                            <i className="fas fa-id-card me-1"></i>
                            شناسه: {certificate.certificate_id}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Certificate Actions */}
                    <div className="certificate-actions">
                      <button 
                        className="btn btn-view btn-certificate"
                        onClick={() => downloadCertificate(certificate)}
                      >
                        <i className="fas fa-eye me-2"></i>
                        مشاهده گواهی
                      </button>
                      <button 
                        className="btn btn-download btn-certificate"
                        onClick={() => downloadCertificate(certificate)}
                      >
                        <i className="fas fa-download me-2"></i>
                        دانلود PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center py-5">
                  <i className="fas fa-certificate fa-4x text-muted mb-3"></i>
                  <h4 className="text-muted">
                    {filter === 'all' && 'هنوز گواهی‌ای دریافت نکرده‌اید'}
                    {filter === 'recent' && 'گواهی جدیدی در ماه اخیر دریافت نکرده‌اید'}
                    {filter === 'excellent' && 'گواهی با نمره عالی ندارید'}
                  </h4>
                  <p className="text-muted">برای دریافت گواهی، ابتدا دوره‌هایی را تکمیل کنید</p>
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
