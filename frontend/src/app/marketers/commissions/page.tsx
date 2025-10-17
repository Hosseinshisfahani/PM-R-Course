'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { marketerApi } from '@/lib/api';
import { MarketerCommissions } from '@/types';
import { Toast, useToast } from '@/components/Toast';

export default function MarketerCommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<MarketerCommissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (user && user.is_staff_member) {
      fetchCommissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCommissions = async () => {
    try {
      const commissionsData = await marketerApi.getCommissions();
      setCommissions(commissionsData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="fas fa-user-lock fa-4x text-primary"></i>
                    </div>
                    <h2 className="h4 mb-3">ورود به حساب کاربری</h2>
                    <p className="text-muted mb-4">
                      برای مشاهده کمیسیون‌های خود باید وارد حساب کاربری شوید
                    </p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="btn btn-primary btn-lg px-5"
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      ورود
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  if (!user.is_staff_member) {
    return (
      <>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="fas fa-ban fa-4x text-warning"></i>
                    </div>
                    <h2 className="h3 mb-3">دسترسی محدود</h2>
                    <p className="text-muted mb-4">
                      برای مشاهده کمیسیون‌ها باید بازاریاب باشید
                    </p>
                    <button
                      onClick={() => window.location.href = '/marketers/join'}
                      className="btn btn-primary btn-lg px-5"
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      درخواست عضویت بازاریاب
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p className="mt-3 h5">در حال بارگذاری کمیسیون‌ها...</p>
          </div>
        </div>
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="fas fa-exclamation-triangle fa-4x text-danger"></i>
                    </div>
                    <h2 className="h3 mb-3">خطا</h2>
                    <p className="text-muted mb-4">{error}</p>
                    <button
                      onClick={fetchCommissions}
                      className="btn btn-primary btn-lg px-5"
                    >
                      <i className="fas fa-redo me-2"></i>
                      تلاش مجدد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toast {...toast} onClose={hideToast} />
      </>
    );
  }

  return (
    <>
      <div className="min-vh-100 bg-light">
        <div className="container py-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="h2 mb-2 fw-bold">
                <i className="fas fa-chart-line text-primary me-2"></i>
                داشبورد کمیسیون‌ها
              </h1>
              <p className="text-muted h6">کمیسیون‌های خود را ردیابی و مدیریت کنید</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="fas fa-dollar-sign fa-2x text-primary"></i>
                  </div>
                  <h3 className="h4 fw-bold text-primary">
                    {commissions?.totals.total.toLocaleString('fa-IR') || '0'} تومان
                  </h3>
                  <p className="text-muted mb-0">کل کمیسیون‌ها</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="fas fa-clock fa-2x text-warning"></i>
                  </div>
                  <h3 className="h4 fw-bold text-warning">
                    {commissions?.totals.pending.toLocaleString('fa-IR') || '0'} تومان
                  </h3>
                  <p className="text-muted mb-0">در انتظار پرداخت</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="fas fa-check-circle fa-2x text-success"></i>
                  </div>
                  <h3 className="h4 fw-bold text-success">
                    {commissions?.totals.paid.toLocaleString('fa-IR') || '0'} تومان
                  </h3>
                  <p className="text-muted mb-0">پرداخت شده</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <h2 className="h5 mb-0">
                <i className="fas fa-history me-2"></i>
                تاریخچه کمیسیون‌ها
              </h2>
            </div>

            {commissions && commissions.commissions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">کد معرفی</th>
                      <th className="border-0">مشتری</th>
                      <th className="border-0">مبلغ خرید</th>
                      <th className="border-0">کمیسیون</th>
                      <th className="border-0">وضعیت</th>
                      <th className="border-0">تاریخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.commissions.map((commission) => (
                      <tr key={commission.id}>
                        <td>
                          <span className="badge bg-primary font-monospace">{commission.referral_code}</span>
                        </td>
                        <td className="fw-bold">{commission.customer_name}</td>
                        <td className="fw-bold text-success">
                          {commission.purchase_amount.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="fw-bold text-primary">
                          {commission.amount.toLocaleString('fa-IR')} تومان
                        </td>
                        <td>
                          <span className={`badge ${
                            commission.status === 'paid' 
                              ? 'bg-success'
                              : commission.status === 'pending'
                              ? 'bg-warning'
                              : 'bg-danger'
                          }`}>
                            {commission.status === 'paid' ? 'پرداخت شده' : 
                             commission.status === 'pending' ? 'در انتظار' : 'لغو شده'}
                          </span>
                        </td>
                        <td className="text-muted">
                          {new Date(commission.created_at).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="card-body">
                  <div className="mb-4">
                    <i className="fas fa-chart-line fa-4x text-muted"></i>
                  </div>
                  <h3 className="h4 mb-3">هنوز کمیسیونی ندارید</h3>
                  <p className="text-muted mb-4">
                    شروع به اشتراک‌گذاری کدهای معرفی خود کنید تا کمیسیون کسب کنید
                  </p>
                  <button
                    onClick={() => window.location.href = '/marketers/referral-codes'}
                    className="btn btn-primary btn-lg"
                    style={{ 
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <i className="fas fa-cog me-2"></i>
                    مدیریت کدهای معرفی
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Commission Information */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h3 className="h5 fw-bold mb-3">
                <i className="fas fa-info-circle text-info me-2"></i>
                نحوه کار کمیسیون‌ها
              </h3>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      کمیسیون‌ها بر اساس درصدی از مبلغ نهایی خرید پس از تخفیف محاسبه می‌شوند
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      کمیسیون‌ها ابتدا "در انتظار" هستند و پس از دوره بررسی تایید می‌شوند
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      می‌توانید تمام کمیسیون‌ها و وضعیت آن‌ها را در این داشبورد ردیابی کنید
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      پرداخت‌ها ماهانه و برای کمیسیون‌های تایید شده انجام می‌شود
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
