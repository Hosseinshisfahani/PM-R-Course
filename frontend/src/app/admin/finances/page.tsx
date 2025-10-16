'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';

interface Purchase {
  id: string;
  user: {
    username: string;
    email: string;
  };
  purchase_type: string;
  course?: {
    title: string;
  };
  section?: {
    title: string;
  };
  amount: number;
  payment_status: string;
  created_at: string;
  referral_code?: {
    code: string;
  };
}

interface Commission {
  id: number;
  marketer: {
    username: string;
    email: string;
  };
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string;
}

export default function AdminFinances() {
  const { user } = useAuth();
  const { canAccessAdminFeatures } = useRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (canAccessAdminFeatures) {
      fetchData();
    }
  }, [canAccessAdminFeatures, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'purchases') {
        const params = new URLSearchParams();
        if (dateRange.start_date) params.append('start_date', dateRange.start_date);
        if (dateRange.end_date) params.append('end_date', dateRange.end_date);
        if (statusFilter) params.append('status', statusFilter);

        const response = await fetch(`/api/admin/purchases/?${params}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPurchases(data);
        }
      } else if (activeTab === 'commissions') {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);

        const response = await fetch(`/api/admin/commissions/?${params}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCommissions(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCommissionPaid = async (commissionId: number) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}/mark-paid/`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error marking commission as paid:', error);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'در انتظار' },
      completed: { class: 'bg-success', text: 'تکمیل شده' },
      failed: { class: 'bg-danger', text: 'ناموفق' },
      refunded: { class: 'bg-secondary', text: 'بازگردانده' },
    };
    const badge = badges[status as keyof typeof badges] || { class: 'bg-secondary', text: 'نامشخص' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getCommissionStatusBadge = (status: string) => {
    const badges = {
      pending: { class: 'bg-warning', text: 'در انتظار' },
      paid: { class: 'bg-success', text: 'پرداخت شده' },
      cancelled: { class: 'bg-danger', text: 'لغو شده' },
    };
    const badge = badges[status as keyof typeof badges] || { class: 'bg-secondary', text: 'نامشخص' };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPurchaseType = (purchase: Purchase) => {
    if (purchase.purchase_type === 'course' && purchase.course) {
      return purchase.course.title;
    } else if (purchase.purchase_type === 'section' && purchase.section) {
      return purchase.section.title;
    }
    return 'نامشخص';
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
    <div className="admin-finances">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>مدیریت مالی</h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie me-2"></i>
            خلاصه مالی
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            تراکنش‌ها
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <i className="fas fa-coins me-2"></i>
            کمیسیون‌ها
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-file-alt me-2"></i>
            گزارشات
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">0 تومان</h4>
                    <p className="mb-0">کل درآمد</p>
                  </div>
                  <div className="fs-1">
                    <i className="fas fa-chart-line"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">0 تومان</h4>
                    <p className="mb-0">درآمد این ماه</p>
                  </div>
                  <div className="fs-1">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="mb-0">0 تومان</h4>
                    <p className="mb-0">کمیسیون‌های در انتظار</p>
                  </div>
                  <div className="fs-1">
                    <i className="fas fa-clock"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">تاریخ شروع</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">تاریخ پایان</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">وضعیت پرداخت</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="pending">در انتظار</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="failed">ناموفق</option>
                    <option value="refunded">بازگردانده</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button className="btn btn-primary w-100" onClick={fetchData}>
                    <i className="fas fa-search me-1"></i>
                    فیلتر
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Purchases Table */}
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
                        <th>کاربر</th>
                        <th>محصول</th>
                        <th>مبلغ</th>
                        <th>وضعیت</th>
                        <th>کد معرف</th>
                        <th>تاریخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>
                            <div>
                              <strong>{purchase.user.username}</strong>
                              <br />
                              <small className="text-muted">{purchase.user.email}</small>
                            </div>
                          </td>
                          <td>{getPurchaseType(purchase)}</td>
                          <td>{purchase.amount.toLocaleString()} تومان</td>
                          <td>{getPaymentStatusBadge(purchase.payment_status)}</td>
                          <td>
                            {purchase.referral_code ? (
                              <span className="badge bg-info">{purchase.referral_code.code}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{new Date(purchase.created_at).toLocaleDateString('fa-IR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div>
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">وضعیت کمیسیون</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="pending">در انتظار</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">&nbsp;</label>
                  <button className="btn btn-primary w-100" onClick={fetchData}>
                    <i className="fas fa-search me-1"></i>
                    فیلتر
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
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
                        <th>بازاریاب</th>
                        <th>مبلغ</th>
                        <th>وضعیت</th>
                        <th>تاریخ ایجاد</th>
                        <th>تاریخ پرداخت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((commission) => (
                        <tr key={commission.id}>
                          <td>
                            <div>
                              <strong>{commission.marketer.username}</strong>
                              <br />
                              <small className="text-muted">{commission.marketer.email}</small>
                            </div>
                          </td>
                          <td>{commission.amount.toLocaleString()} تومان</td>
                          <td>{getCommissionStatusBadge(commission.status)}</td>
                          <td>{new Date(commission.created_at).toLocaleDateString('fa-IR')}</td>
                          <td>
                            {commission.paid_at ? (
                              new Date(commission.paid_at).toLocaleDateString('fa-IR')
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {commission.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleMarkCommissionPaid(commission.id)}
                              >
                                <i className="fas fa-check me-1"></i>
                                پرداخت شد
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-4">
              <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
              <h5>گزارشات مالی</h5>
              <p className="text-muted">این بخش به زودی اضافه خواهد شد.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
