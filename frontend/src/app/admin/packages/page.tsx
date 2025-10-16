'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

interface Package {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  original_price: number;
  package_price: number;
  discount_percentage: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  courses: Array<{
    id: number;
    title: string;
  }>;
}

export default function AdminPackages() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchPackages();
    }
  }, [canAccessAdminFeatures]);

  const fetchPackages = async () => {
    try {
      const params: { search?: string; is_published?: boolean } = {};
      if (searchTerm) params.search = searchTerm;
      if (publishedFilter !== '') params.is_published = publishedFilter === 'true';

      const data = await adminApi.getPackages(params);
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchPackages();
  };

  const handlePublishedFilter = (isPublished: string) => {
    setPublishedFilter(isPublished);
    setLoading(true);
    fetchPackages();
  };

  const handlePackageClick = (packageItem: Package) => {
    setSelectedPackage(packageItem);
    setShowModal(true);
  };

  const handlePackageUpdate = async (packageId: number, updates: Partial<Package>) => {
    try {
      await adminApi.updatePackage(packageId, updates);
      fetchPackages();
      setShowModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const handlePackageDelete = async (packageId: number) => {
    if (confirm('آیا از حذف این پکیج اطمینان دارید؟')) {
      try {
        await adminApi.deletePackage(packageId);
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const getPublishedBadge = (isPublished: boolean) => {
    return isPublished ? (
      <span className="badge bg-success">منتشر شده</span>
    ) : (
      <span className="badge bg-warning">پیش‌نویس</span>
    );
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    return isFeatured ? (
      <span className="badge bg-primary">ویژه</span>
    ) : null;
  };

  const getSavingsAmount = (packageItem: Package) => {
    return packageItem.original_price - packageItem.package_price;
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
    <div className="admin-packages">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>مدیریت پکیج‌ها</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success">
            <i className="fas fa-plus me-1"></i>
            پکیج جدید
          </button>
          <button className="btn btn-primary" onClick={fetchPackages}>
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
                  placeholder="عنوان پکیج..."
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
                fetchPackages();
              }}>
                <i className="fas fa-times me-1"></i>
                پاک کردن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Table */}
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
                    <th>دوره‌ها</th>
                    <th>قیمت اصلی</th>
                    <th>قیمت پکیج</th>
                    <th>صرفه‌جویی</th>
                    <th>وضعیت</th>
                    <th>تاریخ ایجاد</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((packageItem) => (
                    <tr key={packageItem.id}>
                      <td>
                        <div>
                          <strong>{packageItem.title}</strong>
                          <br />
                          <small className="text-muted">{packageItem.short_description}</small>
                          <div className="mt-1">
                            {getPublishedBadge(packageItem.is_published)}
                            {getFeaturedBadge(packageItem.is_featured)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="badge bg-info">{packageItem.courses.length} دوره</span>
                          <br />
                          <small className="text-muted">
                            {packageItem.courses.slice(0, 2).map(c => c.title).join(', ')}
                            {packageItem.courses.length > 2 && '...'}
                          </small>
                        </div>
                      </td>
                      <td>{packageItem.original_price.toLocaleString()} تومان</td>
                      <td>{packageItem.package_price.toLocaleString()} تومان</td>
                      <td>
                        <span className="text-success fw-bold">
                          {getSavingsAmount(packageItem).toLocaleString()} تومان
                        </span>
                        <br />
                        <small className="text-muted">
                          ({packageItem.discount_percentage}% تخفیف)
                        </small>
                      </td>
                      <td>{getPublishedBadge(packageItem.is_published)}</td>
                      <td>{new Date(packageItem.created_at).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link
                            href={`/packages/${packageItem.slug}`}
                            className="btn btn-sm btn-outline-info"
                            target="_blank"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handlePackageClick(packageItem)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handlePackageDelete(packageItem.id)}
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

      {/* Package Detail Modal */}
      {showModal && selectedPackage && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ویرایش پکیج</h5>
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
                  handlePackageUpdate(selectedPackage.id, updates);
                }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">عنوان</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedPackage.title}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">قیمت پکیج</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedPackage.package_price.toLocaleString()}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">وضعیت انتشار</label>
                      <select
                        name="is_published"
                        className="form-select"
                        defaultValue={selectedPackage.is_published.toString()}
                      >
                        <option value="false">پیش‌نویس</option>
                        <option value="true">منتشر شده</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">پکیج ویژه</label>
                      <select
                        name="is_featured"
                        className="form-select"
                        defaultValue={selectedPackage.is_featured.toString()}
                      >
                        <option value="false">خیر</option>
                        <option value="true">بله</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">دوره‌های موجود</label>
                      <div className="border rounded p-3">
                        {selectedPackage.courses.map((course) => (
                          <span key={course.id} className="badge bg-secondary me-2 mb-1">
                            {course.title}
                          </span>
                        ))}
                      </div>
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
