'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category_name: string;
  instructor_name: string;
  effective_price: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminCourses() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchCourses();
    }
  }, [canAccessAdminFeatures]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: { search?: string; is_published?: boolean } = {};
      if (searchTerm) params.search = searchTerm;
      if (publishedFilter !== '') params.is_published = publishedFilter === 'true';

      const data = await adminApi.getCourses(params);
      // Ensure data is always an array
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchCourses();
  };

  const handlePublishedFilter = (isPublished: string) => {
    setPublishedFilter(isPublished);
    setLoading(true);
    fetchCourses();
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCourseUpdate = async (courseId: number, updates: Partial<Course>) => {
    try {
      await adminApi.updateCourse(courseId, updates);
      fetchCourses();
      setShowModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleCourseDelete = async (courseId: number) => {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
      try {
        await adminApi.deleteCourse(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const getPublishedBadge = (isPublished: boolean | undefined) => {
    if (isPublished === undefined || isPublished === null) {
      return <span className="badge bg-secondary">نامشخص</span>;
    }
    return isPublished ? (
      <span className="badge bg-success">منتشر شده</span>
    ) : (
      <span className="badge bg-warning">پیش‌نویس</span>
    );
  };

  const getFeaturedBadge = (isFeatured: boolean | undefined) => {
    if (isFeatured === undefined || isFeatured === null) {
      return null;
    }
    return isFeatured ? (
      <span className="badge bg-primary">ویژه</span>
    ) : null;
  };

  if (!canAccessAdminFeatures) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-lock fa-3x text-muted mb-3"></i>
        <h3>دسترسی غیرمجاز</h3>
        <p className="text-muted">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>مدیریت دوره‌ها</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success">
            <i className="fas fa-plus me-1"></i>
            دوره جدید
          </button>
          <button className="btn btn-primary" onClick={fetchCourses}>
            <i className="fas fa-sync-alt me-1"></i>
            به‌روزرسانی
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">جستجو</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="عنوان دوره..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" onClick={handleSearch}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">وضعیت انتشار</label>
              <select
                className="form-select"
                value={publishedFilter}
                onChange={(e) => handlePublishedFilter(e.target.value)}
              >
                <option value="">همه</option>
                <option value="true">منتشر شده</option>
                <option value="false">پیش‌نویس</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button className="btn btn-outline-secondary w-100" onClick={() => {
                setSearchTerm('');
                setPublishedFilter('');
                setLoading(true);
                fetchCourses();
              }}>
                <i className="fas fa-times me-1"></i>
                پاک کردن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>دسته‌بندی</th>
                    <th>مدرس</th>
                    <th>قیمت</th>
                    <th>وضعیت</th>
                    <th>تاریخ ایجاد</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div>
                          <strong>{course.title}</strong>
                          <br />
                          <small className="text-muted">{course.short_description}</small>
                          <div className="mt-1">
                            {getPublishedBadge(course.is_published)}
                            {getFeaturedBadge(course.is_featured)}
                          </div>
                        </div>
                      </td>
                      <td>{course.category_name}</td>
                      <td>
                        <div>
                          {course.instructor_name}
                        </div>
                      </td>
                      <td>{course.effective_price?.toLocaleString() || '0'} تومان</td>
                      <td>{getPublishedBadge(course.is_published)}</td>
                      <td>{course.created_at ? new Date(course.created_at).toLocaleDateString('fa-IR') : 'نامشخص'}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link
                            href={`/courses/${course.slug}`}
                            className="btn btn-sm btn-outline-info"
                            target="_blank"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleCourseClick(course)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCourseDelete(course.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Course Detail Modal */}
      {showModal && selectedCourse && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ویرایش دوره</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updates = {
                    is_published: formData.get('is_published') === 'true',
                    is_featured: formData.get('is_featured') === 'true',
                  };
                  handleCourseUpdate(selectedCourse.id, updates);
                }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">عنوان</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedCourse.title}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">دسته‌بندی</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedCourse.category_name}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">وضعیت انتشار</label>
                      <select
                        name="is_published"
                        className="form-select"
                        defaultValue={selectedCourse.is_published?.toString() || 'false'}
                      >
                        <option value="false">پیش‌نویس</option>
                        <option value="true">منتشر شده</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">دوره ویژه</label>
                      <select
                        name="is_featured"
                        className="form-select"
                        defaultValue={selectedCourse.is_featured?.toString() || 'false'}
                      >
                        <option value="false">خیر</option>
                        <option value="true">بله</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      انصراف
                    </button>
                    <button type="submit" className="btn btn-primary">
                      ذخیره تغییرات
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
