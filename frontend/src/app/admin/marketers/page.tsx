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
  full_name: string;
  join_date: string;
  referral_codes_count: number;
  active_codes_count: number;
  total_commissions: number;
  pending_commissions: number;
  is_active: boolean;
}

interface ReferralCode {
  id: number;
  code: string;
  discount_percentage: number;
  commission_percentage: number;
  is_active: boolean;
  max_uses: number;
  current_uses: number;
  marketer: number;
  marketer_name: string;
  created_at: string;
  updated_at: string;
}

interface ReferralCodeSettings {
  id: number;
  default_discount_percentage: number;
  default_commission_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function AdminMarketers() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<MarketerRequest[]>([]);
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [settings, setSettings] = useState<ReferralCodeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MarketerRequest | null>(null);
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMarketerModal, setShowMarketerModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    default_discount_percentage: 10,
    default_commission_percentage: 10
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [selectedCode, setSelectedCode] = useState<ReferralCode | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    discount_percentage: 0,
    commission_percentage: 0,
    max_uses: '',
    is_active: true
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchData();
    }
  }, [canAccessAdminFeatures, activeTab, searchTerm, filterActive]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests') {
        const data = await adminApi.getMarketerRequests();
        setRequests(data);
      } else if (activeTab === 'marketers') {
        const data = await adminApi.getMarketers({ search: searchTerm });
        setMarketers(data);
      } else if (activeTab === 'codes') {
        const data = await adminApi.getReferralCodes({ 
          is_active: filterActive !== null ? filterActive : undefined 
        });
        setReferralCodes(data);
      } else if (activeTab === 'settings') {
        const data = await adminApi.getReferralCodeSettings();
        setSettings(data);
        setSettingsForm({
          default_discount_percentage: data.default_discount_percentage,
          default_commission_percentage: data.default_commission_percentage
        });
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

  const handleMarketerClick = (marketer: Marketer) => {
    setSelectedMarketer(marketer);
    setShowMarketerModal(true);
  };

  const handleToggleCodeStatus = async (codeId: number, currentStatus: boolean) => {
    try {
      await adminApi.updateReferralCode(codeId, { is_active: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating code status:', error);
    }
  };

  const handleDeleteCode = async (codeId: number) => {
    if (confirm('آیا از حذف این کد معرفی اطمینان دارید؟')) {
      try {
        await adminApi.deleteReferralCode(codeId);
        fetchData();
      } catch (error) {
        console.error('Error deleting code:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateReferralCodeSettings(settingsForm);
      alert('تنظیمات با موفقیت ذخیره شد');
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('خطا در ذخیره تنظیمات');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleEditCode = (code: ReferralCode) => {
    setSelectedCode(code);
    setEditFormData({
      discount_percentage: code.discount_percentage,
      commission_percentage: code.commission_percentage,
      max_uses: code.max_uses ? code.max_uses.toString() : '',
      is_active: code.is_active
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCode) return;
    
    setSavingEdit(true);
    try {
      const dataToSend = {
        ...editFormData,
        max_uses: editFormData.max_uses ? parseInt(editFormData.max_uses) : undefined
      };
      await adminApi.updateReferralCode(selectedCode.id, dataToSend);
      setShowEditModal(false);
      setSelectedCode(null);
      fetchData();
      alert('کد معرفی با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating code:', error);
      alert('خطا در به‌روزرسانی کد معرفی');
    } finally {
      setSavingEdit(false);
    }
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
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog me-2"></i>
            تنظیمات پیش‌فرض
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>بازاریابان فعال</h5>
              <div className="input-group" style={{ maxWidth: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="جستجو در بازاریابان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            
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
                      <th>تاریخ عضویت</th>
                      <th>کدهای معرفی</th>
                      <th>کمیسیون کل</th>
                      <th>کمیسیون در انتظار</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketers.map((marketer) => (
                      <tr key={marketer.id}>
                        <td>
                          <div>
                            <strong>{marketer.full_name}</strong>
                            <br />
                            <small className="text-muted">@{marketer.username}</small>
                          </div>
                        </td>
                        <td>{marketer.email}</td>
                        <td>{new Date(marketer.join_date).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <span className="badge bg-info">{marketer.referral_codes_count}</span>
                          <small className="text-muted"> ({marketer.active_codes_count} فعال)</small>
                        </td>
                        <td>
                          <span className="text-success fw-bold">
                            {marketer.total_commissions.toLocaleString('fa-IR')} تومان
                          </span>
                        </td>
                        <td>
                          <span className="text-warning fw-bold">
                            {marketer.pending_commissions.toLocaleString('fa-IR')} تومان
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${marketer.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {marketer.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleMarketerClick(marketer)}
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

      {/* Codes Tab */}
      {activeTab === 'codes' && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>کدهای معرفی</h5>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  style={{ width: '150px' }}
                  value={filterActive === null ? '' : filterActive.toString()}
                  onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
                >
                  <option value="">همه کدها</option>
                  <option value="true">فعال</option>
                  <option value="false">غیرفعال</option>
                </select>
              </div>
            </div>
            
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
                      <th>کد معرفی</th>
                      <th>بازاریاب</th>
                      <th>درصد تخفیف</th>
                      <th>درصد کمیسیون</th>
                      <th>استفاده</th>
                      <th>وضعیت</th>
                      <th>تاریخ ایجاد</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralCodes.map((code) => (
                      <tr key={code.id}>
                        <td>
                          <code className="bg-light px-2 py-1 rounded">{code.code}</code>
                        </td>
                        <td>{code.marketer_name}</td>
                        <td>
                          <span className="badge bg-info">{code.discount_percentage}%</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{code.commission_percentage}%</span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {code.current_uses} / {code.max_uses}
                          </span>
                          <div className="progress mt-1" style={{ height: '4px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ width: `${(code.current_uses / code.max_uses) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${code.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {code.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>{new Date(code.created_at).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditCode(code)}
                              title="ویرایش"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleToggleCodeStatus(code.id, code.is_active)}
                              title={code.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            >
                              <i className={`fas fa-${code.is_active ? 'pause' : 'play'}`}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCode(code.id)}
                              title="حذف"
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
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5>تنظیمات پیش‌فرض کدهای معرفی</h5>
            </div>
            
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              این تنظیمات به عنوان مقادیر پیش‌فرض برای تمام کدهای معرفی جدید که توسط بازاریابان ایجاد می‌شوند، استفاده خواهد شد.
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">در حال بارگذاری...</span>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">درصد تخفیف پیش‌فرض</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settingsForm.default_discount_percentage}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          default_discount_percentage: parseFloat(e.target.value) || 0
                        })}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <small className="text-muted">درصد تخفیفی که به مشتریان ارائه می‌شود</small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">درصد کمیسیون پیش‌فرض</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settingsForm.default_commission_percentage}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          default_commission_percentage: parseFloat(e.target.value) || 0
                        })}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                    <small className="text-muted">درصد کمیسیونی که به بازاریاب پرداخت می‌شود</small>
                  </div>
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (settings) {
                    setSettingsForm({
                      default_discount_percentage: settings.default_discount_percentage,
                      default_commission_percentage: settings.default_commission_percentage
                    });
                  }
                }}
                disabled={savingSettings}
              >
                <i className="fas fa-undo me-1"></i>
                بازنشانی
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    ذخیره تنظیمات
                  </>
                )}
              </button>
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

      {/* Marketer Detail Modal */}
      {showMarketerModal && selectedMarketer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">جزئیات بازاریاب</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMarketerModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">نام کامل</label>
                    <p>{selectedMarketer.full_name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">نام کاربری</label>
                    <p>@{selectedMarketer.username}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">ایمیل</label>
                    <p>{selectedMarketer.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">تاریخ عضویت</label>
                    <p>{new Date(selectedMarketer.join_date).toLocaleDateString('fa-IR')}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">وضعیت</label>
                    <p>
                      <span className={`badge ${selectedMarketer.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {selectedMarketer.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">کدهای معرفی</label>
                    <p>
                      <span className="badge bg-info">{selectedMarketer.referral_codes_count}</span>
                      <small className="text-muted"> ({selectedMarketer.active_codes_count} فعال)</small>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">کمیسیون کل</label>
                    <p className="text-success fw-bold">
                      {selectedMarketer.total_commissions.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">کمیسیون در انتظار</label>
                    <p className="text-warning fw-bold">
                      {selectedMarketer.pending_commissions.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMarketerModal(false)}
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Code Modal */}
      {showEditModal && selectedCode && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ویرایش کد معرفی</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">کد معرفی</label>
                    <p><code className="bg-light px-2 py-1 rounded">{selectedCode.code}</code></p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">بازاریاب</label>
                    <p>{selectedCode.marketer_name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">درصد تخفیف</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        step="0.01"
                        value={editFormData.discount_percentage}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          discount_percentage: parseFloat(e.target.value) || 0
                        })}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">درصد کمیسیون</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        step="0.01"
                        value={editFormData.commission_percentage}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          commission_percentage: parseFloat(e.target.value) || 0
                        })}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">حداکثر استفاده</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={editFormData.max_uses}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        max_uses: e.target.value
                      })}
                    />
                    <small className="text-muted">خالی = نامحدود</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">وضعیت</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editFormData.is_active}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          is_active: e.target.checked
                        })}
                      />
                      <label className="form-check-label">
                        {editFormData.is_active ? 'فعال' : 'غیرفعال'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
