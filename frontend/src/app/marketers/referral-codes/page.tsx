'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { marketerApi } from '@/lib/api';
import { ReferralCode } from '@/types';
import { Toast, useToast } from '@/components/Toast';

export default function MarketerReferralCodesPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingCode, setDeletingCode] = useState<number | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (user && user.is_staff_member) {
      fetchCodes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCodes = async () => {
    try {
      const codesData = await marketerApi.getCodes();
      setCodes(codesData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch referral codes');
    } finally {
      setLoading(false);
    }
  };

  const copyLinkToClipboard = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    showToast('لینک کد معرفی کپی شد', 'success');
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('کد معرفی کپی شد', 'success');
  };

  const toggleCodeStatus = async (codeId: number, isActive: boolean) => {
    try {
      await marketerApi.updateCode(codeId, { is_active: isActive });
      await fetchCodes(); // Refresh the list
      showToast(isActive ? 'کد معرفی فعال شد' : 'کد معرفی غیرفعال شد', 'success');
    } catch (error: any) {
      showToast('خطا در تغییر وضعیت کد', 'error');
    }
  };

  const deleteCode = async (codeId: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این کد معرفی را حذف کنید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    setDeletingCode(codeId);
    try {
      await marketerApi.deleteCode(codeId);
      await fetchCodes(); // Refresh the list
      showToast('کد معرفی حذف شد', 'success');
    } catch (error: any) {
      showToast('خطا در حذف کد معرفی', 'error');
    } finally {
      setDeletingCode(null);
    }
  };

  if (!user) {
    return (
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
                    برای مشاهده کدهای معرفی خود باید وارد حساب کاربری شوید
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
        <Toast {...toast} onClose={hideToast} />
      </div>
    );
  }

  if (!user.is_staff_member) {
    return (
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
                    برای دسترسی به این صفحه باید بازاریاب باشید
                  </p>
                  <div className="alert alert-warning border-0 mb-4">
                    <p className="mb-0">
                      <strong>وضعیت فعلی:</strong> شما به عنوان کاربر {user.user_type} وارد شده‌اید.
                      <br />
                      برای تبدیل شدن به بازاریاب، باید درخواست دهید و توسط ادمین تایید شوید.
                    </p>
                  </div>
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
        <Toast {...toast} onClose={hideToast} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3 h5">در حال بارگذاری کدهای معرفی...</p>
        </div>
        <Toast {...toast} onClose={hideToast} />
      </div>
    );
  }

  if (error) {
    return (
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
                    onClick={fetchCodes}
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
        <Toast {...toast} onClose={hideToast} />
      </div>
    );
  }

  return (
    <>
      <div className="min-vh-100 bg-light">
      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
              <div className="mb-3 mb-md-0">
                <h1 className="h2 mb-2 fw-bold">
                  <i className="fas fa-gift text-primary me-2"></i>
                  کدهای معرفی من
                </h1>
                <p className="text-muted h6">کدهای معرفی خود را مدیریت کنید و عملکرد آن‌ها را ردیابی کنید</p>
              </div>
              <div>
                <Link
                  href="/marketers/referral-codes/new"
                  className="btn btn-primary btn-lg"
                  style={{ 
                    borderRadius: '50px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  ایجاد کد جدید
                </Link>
              </div>
            </div>
          </div>
        </div>

          {/* Stats Overview */}
          {codes.length > 0 && (
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-gift fa-2x text-primary"></i>
                    </div>
                    <h3 className="h4 fw-bold text-primary">{codes.length}</h3>
                    <p className="text-muted mb-0">کل کدها</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-check-circle fa-2x text-success"></i>
                    </div>
                    <h3 className="h4 fw-bold text-success">
                      {codes.filter(code => code.is_active).length}
                    </h3>
                    <p className="text-muted mb-0">کدهای فعال</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-chart-line fa-2x text-info"></i>
                    </div>
                    <h3 className="h4 fw-bold text-info">
                      {codes.reduce((sum, code) => sum + code.current_uses, 0)}
                    </h3>
                    <p className="text-muted mb-0">کل استفاده‌ها</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <i className="fas fa-percentage fa-2x text-warning"></i>
                    </div>
                    <h3 className="h4 fw-bold text-warning">
                      {codes.length > 0 
                        ? `${(codes.reduce((sum, code) => sum + code.commission_percentage, 0) / codes.length).toFixed(1)}%`
                        : '0%'
                      }
                    </h3>
                    <p className="text-muted mb-0">میانگین کمیسیون</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Codes Grid */}
          {codes.length > 0 ? (
            <div className="row g-4">
              {codes.map((code) => (
                <div key={code.id} className="col-lg-4 col-md-6">
                  <div className="card border-0 shadow-sm h-100 hover-lift">
                    <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold font-monospace">{code.code}</h5>
                        <span className={`badge ${code.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {code.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="row g-3 mb-4">
                        <div className="col-6">
                          <div className="text-center">
                            <i className="fas fa-gift text-success fa-lg mb-2"></i>
                            <div className="fw-bold text-success">{code.discount_percentage}%</div>
                            <small className="text-muted">تخفیف مشتری</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center">
                            <i className="fas fa-percentage text-primary fa-lg mb-2"></i>
                            <div className="fw-bold text-primary">{code.commission_percentage}%</div>
                            <small className="text-muted">کمیسیون شما</small>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">استفاده:</span>
                          <span className="fw-bold">
                            {code.current_uses}
                            {code.max_uses && ` / ${code.max_uses}`}
                            {!code.max_uses && ' / ∞'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">تاریخ ایجاد:</span>
                          <span className="fw-bold">
                            {new Date(code.created_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <div className="row g-2">
                          <div className="col-6">
                            <button
                              onClick={() => copyLinkToClipboard(code.code)}
                              className="btn btn-outline-primary btn-sm w-100"
                            >
                              <i className="fas fa-link me-1"></i>
                              کپی لینک
                            </button>
                          </div>
                          <div className="col-6">
                            <button
                              onClick={() => copyCodeToClipboard(code.code)}
                              className="btn btn-outline-secondary btn-sm w-100"
                            >
                              <i className="fas fa-copy me-1"></i>
                              کپی کد
                            </button>
                          </div>
                        </div>
                        
                        <div className="row g-2">
                          <div className="col-12">
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/r/${code.code}`;
                                window.open(url, '_blank');
                              }}
                              className="btn btn-outline-info btn-sm w-100"
                            >
                              <i className="fas fa-eye me-1"></i>
                              پیش‌نمایش
                            </button>
                          </div>
                        </div>
                        
                        <div className="row g-2">
                          <div className="col-6">
                            <button
                              onClick={() => toggleCodeStatus(code.id, !code.is_active)}
                              className={`btn btn-sm w-100 ${
                                code.is_active
                                  ? 'btn-warning'
                                  : 'btn-success'
                              }`}
                            >
                              {code.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>
                          </div>
                          <div className="col-6">
                            <button
                              onClick={() => deleteCode(code.id)}
                              disabled={deletingCode === code.id}
                              className="btn btn-outline-danger btn-sm w-100"
                            >
                              {deletingCode === code.id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  در حال حذف...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-trash me-1"></i>
                                  حذف
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <i className="fas fa-gift fa-4x text-muted"></i>
                  </div>
                  <h3 className="h4 mb-3">هنوز کد معرفی ندارید</h3>
                  <p className="text-muted mb-4">
                    اولین کد معرفی خود را ایجاد کنید تا از شبکه خود کمیسیون کسب کنید. 
                    کدهای خود را به اشتراک بگذارید و از هر معرفی موفق درآمد کسب کنید!
                  </p>
                  <Link
                    href="/marketers/referral-codes/new"
                    className="btn btn-primary btn-lg"
                    style={{ 
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    ایجاد اولین کد
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Toast {...toast} onClose={hideToast} />
      
      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
      
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
