'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';
import { adminApi } from '@/lib/api';

interface MarketerRequest {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  full_name: string;
  phone_number: string;
  email: string;
  experience_level: string;
  current_job: string;
  interest_area: string;
  motivation: string;
  marketing_experience: string;
  instagram_handle: string;
  telegram_handle: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

interface Marketer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  referral_codes_count: number;
  total_commissions: number;
  pending_commissions: number;
}

export default function AdminMarketers() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<MarketerRequest[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MarketerRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchData();
    }
  }, [canAccessAdminFeatures, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const data = await adminApi.getMarketerRequests();
        setRequests(data);
      } else if (activeTab === 'marketers') {
        // This would need to be implemented in the backend
        // For now, we'll show a placeholder
        setMarketers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await adminApi.approveMarketerRequest(requestId, adminNotes);
      } else if (action === 'reject') {
        await adminApi.rejectMarketerRequest(requestId, adminNotes);
      }
      
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  const handleRequestClick = (request: MarketerRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'در انتظار' },
      approved: { class: 'bg-success', text: 'تایید شده' },
      rejected: { class: 'bg-danger', text: 'رد شده' },
    };
    const badge = badges[status as keyof typeof badges] || { class: 'bg-secondary', text: 'نامشخص' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getExperienceLevel = (level: string) => {
    const levels = {
      beginner: 'مبتدی',
      intermediate: 'متوسط',
      advanced: 'پیشرفته',
      expert: 'متخصص',
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getInterestArea = (area: string) => {
    const areas = {
      medical: 'دوره‌های پزشکی و سلامت',
      technology: 'دوره‌های تکنولوژی',
      business: 'دوره‌های کسب و کار',
      education: 'دوره‌های آموزشی',
      all: 'همه موضوعات',
    };
    return areas[area as keyof typeof areas] || area;
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
    <div className="admin-marketers">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>باشگاه بازاریابان</h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <i className="fas fa-user-plus me-2"></i>
            درخواست‌های عضویت
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'marketers' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketers')}
          >
            <i className="fas fa-users me-2"></i>
            بازاریابان فعال
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'codes' ? 'active' : ''}`}
            onClick={() => setActiveTab('codes')}
          >
            <i className="fas fa-gift me-2"></i>
            کدهای معرفی
          </button>
        </li>
      </ul>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
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
                      <th>نام</th>
                      <th>ایمیل</th>
                      <th>سطح تجربه</th>
                      <th>حوزه علاقه</th>
                      <th>وضعیت</th>
                      <th>تاریخ درخواست</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div>
                            <strong>{request.full_name}</strong>
                            <br />
                            <small className="text-muted">@{request.user.username}</small>
                          </div>
                        </td>
                        <td>{request.email}</td>
                        <td>{getExperienceLevel(request.experience_level)}</td>
                        <td>{getInterestArea(request.interest_area)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.created_at).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleRequestClick(request)}
                          >
                            <i className="fas fa-eye me-1"></i>
                            مشاهده
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketers Tab */}
      {activeTab === 'marketers' && (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-4">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5>بازاریابان فعال</h5>
              <p className="text-muted">این بخش به زودی اضافه خواهد شد.</p>
            </div>
          </div>
        </div>
      )}

      {/* Codes Tab */}
      {activeTab === 'codes' && (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-4">
              <i className="fas fa-gift fa-3x text-muted mb-3"></i>
              <h5>کدهای معرفی</h5>
              <p className="text-muted">این بخش به زودی اضافه خواهد شد.</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">جزئیات درخواست عضویت</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">نام کامل</label>
                    <p>{selectedRequest.full_name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ایمیل</label>
                    <p>{selectedRequest.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">شماره تلفن</label>
                    <p>{selectedRequest.phone_number}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">سطح تجربه</label>
                    <p>{getExperienceLevel(selectedRequest.experience_level)}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">شغل فعلی</label>
                    <p>{selectedRequest.current_job || 'نامشخص'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">حوزه علاقه</label>
                    <p>{getInterestArea(selectedRequest.interest_area)}</p>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">انگیزه</label>
                    <p>{selectedRequest.motivation}</p>
                  </div>
                  {selectedRequest.marketing_experience && (
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">تجربه بازاریابی</label>
                      <p>{selectedRequest.marketing_experience}</p>
                    </div>
                  )}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">یادداشت‌های ادمین</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="یادداشت‌های خود را اینجا بنویسید..."
                    />
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
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                    >
                      <i className="fas fa-times me-1"></i>
                      رد درخواست
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    >
                      <i className="fas fa-check me-1"></i>
                      تایید درخواست
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
