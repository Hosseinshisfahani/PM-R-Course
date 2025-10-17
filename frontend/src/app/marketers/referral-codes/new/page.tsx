'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { marketerApi } from '@/lib/api';
import { Toast, useToast } from '@/components/Toast';

export default function NewReferralCodePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    max_uses: '',
  });

  // Function to generate a unique referral code
  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.code && formData.code.length > 20) {
      setError('کد معرفی نمی‌تواند بیش از ۲۰ کاراکتر باشد');
      setLoading(false);
      return;
    }

    if (formData.code && !/^[A-Za-z0-9]+$/.test(formData.code)) {
      setError('کد معرفی باید فقط شامل حروف و اعداد باشد');
      setLoading(false);
      return;
    }

    try {
      // Generate a unique code if the field is empty
      const finalCode = formData.code.trim() || generateUniqueCode();
      
      const data = {
        code: finalCode, // Send the generated code or custom code
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
      };
      
      await marketerApi.createCode(data);
      showToast('کد معرفی با موفقیت ایجاد شد', 'success');
      router.push('/marketers/referral-codes');
    } catch (error: any) {
      setError(error.message || 'خطا در ایجاد کد معرفی');
      showToast('خطا در ایجاد کد معرفی', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
                      برای ایجاد کد معرفی باید وارد حساب کاربری شوید
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
                      برای ایجاد کد معرفی باید بازاریاب باشید
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
                    <i className="fas fa-plus text-primary me-2"></i>
                    ایجاد کد معرفی جدید
                  </h1>
                  <p className="text-muted h6">کد معرفی منحصر به فرد ایجاد کنید و با شبکه خود به اشتراک بگذارید</p>
                </div>
                <div className="d-none d-md-block">
                  <div className="alert alert-info border-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-lightbulb text-info me-2"></i>
                      <div>
                        <strong>نکته:</strong> تخفیف بالاتر = جذابیت بیشتر برای مشتریان
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <h2 className="h4 mb-0">
                    <i className="fas fa-cog me-2"></i>
                    تنظیمات کد معرفی
                  </h2>
                  <p className="mb-0 mt-2 opacity-75">پارامترهای کد معرفی خود را پیکربندی کنید</p>
                </div>
                
                <form onSubmit={handleSubmit} className="card-body p-4 p-md-5">
                  {/* Code Section */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tag text-primary me-2"></i>
                      کد معرفی
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="کد سفارشی خود را وارد کنید (اختیاری)"
                      className={`form-control form-control-lg ${formData.code && (formData.code.length > 20 || !/^[A-Za-z0-9]*$/.test(formData.code)) ? 'is-invalid' : ''}`}
                      maxLength={20}
                      pattern="[A-Za-z0-9]*"
                    />
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      خالی بگذارید تا کد منحصر به فرد خودکار تولید شود
                    </div>
                    {formData.code && formData.code.length > 20 && (
                      <div className="invalid-feedback">
                        کد معرفی نمی‌تواند بیش از ۲۰ کاراکتر باشد
                      </div>
                    )}
                    {formData.code && !/^[A-Za-z0-9]*$/.test(formData.code) && (
                      <div className="invalid-feedback">
                        کد معرفی باید فقط شامل حروف و اعداد باشد
                      </div>
                    )}
                  </div>

                  {/* Percentage Settings */}
                  {/* Default Settings Info */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex">
                      <i className="fas fa-cog fa-lg text-info me-3 mt-1"></i>
                      <div>
                        <h5 className="alert-heading mb-2">تنظیمات پیش‌فرض</h5>
                        <p className="mb-0">
                          درصد تخفیف و کمیسیون این کد معرفی بر اساس تنظیمات پیش‌فرض سیستم تعیین می‌شود.
                          برای تغییر این مقادیر، با مدیر سیستم تماس بگیرید.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Limits */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      <i className="fas fa-limit text-warning me-2"></i>
                      محدودیت استفاده
                    </label>
                    <input
                      type="number"
                      name="max_uses"
                      value={formData.max_uses}
                      onChange={handleChange}
                      min="1"
                      placeholder="تعداد استفاده را وارد کنید (اختیاری)"
                      className="form-control form-control-lg"
                    />
                    <div className="form-text">
                      <i className="fas fa-infinity text-warning me-1"></i>
                      خالی بگذارید برای استفاده نامحدود
                    </div>
                  </div>

                  {/* Important Information */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex">
                      <i className="fas fa-info-circle fa-lg text-info me-3 mt-1"></i>
                      <div>
                        <h5 className="alert-heading mb-3">راهنمای مهم</h5>
                        <ul className="mb-0">
                          <li>کدهای معرفی حساس به حروف بزرگ/کوچک هستند و باید منحصر به فرد باشند</li>
                          <li>فقط قبل از استفاده توسط مشتریان می‌توانید کدها را ویرایش کنید</li>
                          <li>کمیسیون‌ها بر اساس مبلغ نهایی خرید پس از تخفیف محاسبه می‌شوند</li>
                          <li>درصد تخفیف بالاتر مشتریان بیشتری جذب می‌کند</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="alert alert-danger border-0 mb-4">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-exclamation-triangle me-3 mt-1"></i>
                        <div>
                          <h6 className="alert-heading">خطا</h6>
                          <p className="mb-0">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="d-flex flex-column flex-md-row gap-3 pt-4 border-top">
                    <button
                      type="button"
                      onClick={() => router.push('/marketers/referral-codes')}
                      className="btn btn-outline-secondary btn-lg px-5"
                    >
                      <i className="fas fa-times me-2"></i>
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg px-5"
                      style={{ 
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          در حال ایجاد...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          ایجاد کد معرفی
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
