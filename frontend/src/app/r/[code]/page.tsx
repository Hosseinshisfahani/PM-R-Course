'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { referralApi } from '@/lib/api';

export default function ReferralLandingPage() {
  const params = useParams();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState('');
  const [referralData, setReferralData] = useState<any>(null);

  useEffect(() => {
    if (code) {
      validateCode();
    }
  }, [code]);

  const validateCode = async () => {
    try {
      const response = await referralApi.validateCode(code);
      if (response.valid) {
        setValid(true);
        setReferralData(response);
        // Track the referral code visit
        await referralApi.trackCode(code);
      } else {
        setError(response.reason || 'Invalid referral code');
      }
    } catch (error: any) {
      setError('Failed to validate referral code');
    } finally {
      setLoading(false);
    }
  };

  const redirectToCourses = () => {
    // Set the referral code in localStorage for the checkout process
    localStorage.setItem('referral_code', code);
    window.location.href = '/courses';
  };

  if (loading) {
    return (
      <div>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">در حال بررسی...</span>
            </div>
            <p className="mt-3 h5">در حال بررسی کد معرفی...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div>
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <i className="fas fa-exclamation-triangle fa-4x text-danger"></i>
                    </div>
                    <h2 className="h3 mb-3">کد معرفی نامعتبر</h2>
                    <p className="text-muted mb-4">{error}</p>
                    <button
                      onClick={() => window.location.href = '/courses'}
                      className="btn btn-primary btn-lg px-5"
                    >
                      <i className="fas fa-search me-2"></i>
                      مشاهده دوره‌ها
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container py-5">
          {/* Hero Section */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center text-white mb-5" data-aos="fade-up">
                <div className="mb-4">
                  <i className="fas fa-gift fa-4x text-white"></i>
                </div>
                <h1 className="display-4 fw-bold mb-4">
                  خوش آمدید! شما تخفیف ویژه دارید
                </h1>
                <p className="lead mb-5">
                  شما برای شرکت در دوره‌های آموزشی پزشکی ما با تخفیف انحصاری دعوت شده‌اید
                </p>
              </div>

              {/* Main Offer Card */}
              <div className="card border-0 shadow-lg" data-aos="fade-up" data-aos-delay="200">
                <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="h3 mb-2">پیشنهاد ویژه</h2>
                      <p className="mb-0">تخفیف انحصاری برای شما</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                      <div className="display-4 fw-bold text-white">
                        {referralData?.value}% تخفیف
                      </div>
                      <div className="text-white-50">زمان محدود</div>
                    </div>
                  </div>
                </div>

                <div className="card-body p-5">
                  <div className="row">
                    {/* Benefits */}
                    <div className="col-md-6 mb-4">
                      <h3 className="h5 fw-bold mb-4">
                        <i className="fas fa-star text-warning me-2"></i>
                        آنچه دریافت می‌کنید:
                      </h3>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item border-0 px-0">
                          <i className="fas fa-check-circle text-success me-3"></i>
                          <span>دسترسی به دوره‌های پزشکی پیشرفته</span>
                        </div>
                        <div className="list-group-item border-0 px-0">
                          <i className="fas fa-check-circle text-success me-3"></i>
                          <span>مدرسین متخصص و محتوای باکیفیت</span>
                        </div>
                        <div className="list-group-item border-0 px-0">
                          <i className="fas fa-check-circle text-success me-3"></i>
                          <span>دسترسی مادام‌العمر به مطالب</span>
                        </div>
                        <div className="list-group-item border-0 px-0">
                          <i className="fas fa-check-circle text-success me-3"></i>
                          <span>گواهی تکمیل دوره</span>
                        </div>
                      </div>
                    </div>

                    {/* Code Details */}
                    <div className="col-md-6 mb-4">
                      <h3 className="h5 fw-bold mb-4">
                        <i className="fas fa-tag text-primary me-2"></i>
                        جزئیات کد معرفی:
                      </h3>
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <div className="row align-items-center mb-3">
                            <div className="col-6">
                              <span className="text-muted">کد شما:</span>
                            </div>
                            <div className="col-6">
                              <span className="fw-bold text-primary fs-5">{code}</span>
                            </div>
                          </div>
                          <div className="row align-items-center">
                            <div className="col-6">
                              <span className="text-muted">تخفیف:</span>
                            </div>
                            <div className="col-6">
                              <span className="fw-bold text-success fs-5">{referralData?.value}% تخفیف</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center mt-4">
                    <button
                      onClick={redirectToCourses}
                      className="btn btn-primary btn-lg px-5 py-3"
                      style={{ 
                        borderRadius: '50px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      <i className="fas fa-play me-2"></i>
                      شروع یادگیری
                    </button>
                    <p className="mt-3 text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      این تخفیف به صورت خودکار در هنگام پرداخت اعمال خواهد شد
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="row mt-5">
                <div className="col-md-4 text-center text-white mb-3" data-aos="fade-up" data-aos-delay="300">
                  <i className="fas fa-shield-alt fa-2x mb-2"></i>
                  <h6>امن و قابل اعتماد</h6>
                </div>
                <div className="col-md-4 text-center text-white mb-3" data-aos="fade-up" data-aos-delay="400">
                  <i className="fas fa-users fa-2x mb-2"></i>
                  <h6>هزاران دانشجو راضی</h6>
                </div>
                <div className="col-md-4 text-center text-white mb-3" data-aos="fade-up" data-aos-delay="500">
                  <i className="fas fa-headset fa-2x mb-2"></i>
                  <h6>پشتیبانی 24/7</h6>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-center mt-5">
                <p className="text-white-50">
                  سوالی دارید؟ با ما تماس بگیرید{' '}
                  <a href="mailto:support@example.com" className="text-white">
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}