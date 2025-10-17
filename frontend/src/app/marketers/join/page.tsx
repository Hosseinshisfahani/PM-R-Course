'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { marketerApi } from '@/lib/api';

export default function MarketerJoinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    experience_level: 'beginner',
    current_job: '',
    interest_area: 'medical',
    motivation: '',
    marketing_experience: '',
    instagram_handle: '',
    telegram_handle: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      // Check if user already has a request
      marketerApi.getMyRequest()
        .then((data) => {
          // Check if the response contains an error (no request found)
          if (data.error) {
            setExistingRequest(null);
          } else {
            setExistingRequest(data);
          }
          setCheckingExisting(false);
        })
        .catch(() => {
          // No existing request found
          setExistingRequest(null);
          setCheckingExisting(false);
        });
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await marketerApi.createRequest(formData);
      setSuccess(true);
    } catch (error: any) {
      const errorMessage = error.message || 'خطا در ارسال درخواست. لطفا دوباره تلاش کنید.';
      if (errorMessage.includes('already have a pending request') || errorMessage.includes('قبلاً درخواست')) {
        setError('شما قبلاً درخواست عضویت ثبت کرده‌اید. لطفاً منتظر بررسی آن باشید.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (checkingExisting || authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بررسی...</span>
          </div>
          <p className="mt-3">در حال بررسی وضعیت...</p>
        </div>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div className={`bg-${existingRequest.status === 'approved' ? 'success' : existingRequest.status === 'rejected' ? 'danger' : 'warning'} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center`} 
                         style={{ width: '100px', height: '100px' }}>
                      <i className={`fas fa-${existingRequest.status === 'approved' ? 'check' : existingRequest.status === 'rejected' ? 'times' : 'clock'} fa-3x text-${existingRequest.status === 'approved' ? 'success' : existingRequest.status === 'rejected' ? 'danger' : 'warning'}`}></i>
                    </div>
                  </div>
                  <h2 className="h3 mb-3">
                    {existingRequest.status === 'approved' && 'درخواست شما تایید شد!'}
                    {existingRequest.status === 'rejected' && 'درخواست شما رد شد'}
                    {existingRequest.status === 'pending' && 'درخواست شما در حال بررسی است'}
                  </h2>
                  <p className="text-muted mb-4">
                    {existingRequest.status === 'approved' && 'تبریک! شما اکنون عضو تیم بازاریابان ما هستید.'}
                    {existingRequest.status === 'rejected' && (existingRequest.admin_notes || 'متأسفانه درخواست شما مورد تایید قرار نگرفت.')}
                    {existingRequest.status === 'pending' && 'درخواست شما در اسرع وقت بررسی خواهد شد و نتیجه به شما اطلاع داده خواهد شد.'}
                  </p>
                  <div className="d-grid gap-3">
                    {existingRequest.status === 'approved' && (
                      <button
                        onClick={() => router.push('/marketers/referral-codes')}
                        className="btn btn-success btn-lg"
                      >
                        <i className="fas fa-gift me-2"></i>
                        مشاهده کدهای معرفی
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/')}
                      className="btn btn-outline-secondary"
                    >
                      <i className="fas fa-home me-2"></i>
                      بازگشت به صفحه اصلی
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
                    برای پیوستن به تیم بازاریابان ما، ابتدا وارد حساب کاربری خود شوید
                  </p>
            <button
              onClick={() => router.push('/login')}
                    className="btn btn-primary btn-lg px-5"
            >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    ورود
            </button>
                  <div className="mt-3">
                    <small className="text-muted">
                      حساب کاربری ندارید؟{' '}
                      <a href="/signup" className="text-primary">ثبت‌نام کنید</a>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="fas fa-check fa-3x text-success"></i>
                    </div>
            </div>
                  <h2 className="h3 mb-3">درخواست شما با موفقیت ارسال شد!</h2>
                  <p className="text-muted mb-4 lead">
                    از علاقه شما به پیوستن به تیم بازاریابان ما سپاسگزاریم.
                    درخواست شما در اسرع وقت بررسی خواهد شد و نتیجه از طریق ایمیل یا تلفن به شما اطلاع داده خواهد شد.
                  </p>
                  <div className="alert alert-info border-0 mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    زمان بررسی درخواست: 2 تا 3 روز کاری
                  </div>
                  <div className="d-grid gap-3">
              <button
                onClick={() => router.push('/marketers/request-status')}
                      className="btn btn-primary btn-lg"
              >
                      <i className="fas fa-eye me-2"></i>
                      مشاهده وضعیت درخواست
              </button>
                <button
                  onClick={() => router.push('/')}
                      className="btn btn-outline-secondary"
                >
                      <i className="fas fa-home me-2"></i>
                      بازگشت به صفحه اصلی
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
    <div className="marketer-join-page">
      {/* Hero Section */}
      <section className="hero-section py-5" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0" data-aos="fade-right">
              <h1 className="display-4 fw-bold mb-4">
                به تیم فروشندگان ما بپیوندید
              </h1>
              <p className="lead mb-4">
                با معرفی دوره‌های آموزشی ما به دیگران، درآمد کسب کنید و به رشد علم و آگاهی جامعه کمک کنید
              </p>
              <div className="d-flex gap-3 mb-4">
                <div className="text-center">
                  <h3 className="fw-bold">10-20%</h3>
                  <small>کمیسیون فروش</small>
                </div>
                <div className="border-end border-white border-opacity-25"></div>
                <div className="text-center">
                  <h3 className="fw-bold">رایگان</h3>
                  <small>ثبت‌نام و عضویت</small>
                </div>
                <div className="border-end border-white border-opacity-25"></div>
                <div className="text-center">
                  <h3 className="fw-bold">نامحدود</h3>
                  <small>درآمد ماهانه</small>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-4 p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="card border-0 bg-white text-center h-100 hover-lift">
                      <div className="card-body">
                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ width: '60px', height: '60px' }}>
                          <i className="fas fa-chart-line fa-2x text-success"></i>
                        </div>
                        <h6 className="fw-bold">رشد مداوم</h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card border-0 bg-white text-center h-100 hover-lift">
                      <div className="card-body">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ width: '60px', height: '60px' }}>
                          <i className="fas fa-users fa-2x text-primary"></i>
                        </div>
                        <h6 className="fw-bold">تیم حرفه‌ای</h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card border-0 bg-white text-center h-100 hover-lift">
                      <div className="card-body">
                        <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ width: '60px', height: '60px' }}>
                          <i className="fas fa-gift fa-2x text-warning"></i>
                        </div>
                        <h6 className="fw-bold">پاداش‌های ویژه</h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card border-0 bg-white text-center h-100 hover-lift">
                      <div className="card-body">
                        <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                             style={{ width: '60px', height: '60px' }}>
                          <i className="fas fa-headset fa-2x text-info"></i>
                        </div>
                        <h6 className="fw-bold">پشتیبانی 24/7</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="h1 mb-3">چرا به ما بپیوندید؟</h2>
            <p className="lead text-muted">مزایای عضویت در تیم بازاریابان ما</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
              <div className="card border-0 shadow-sm h-100 text-center hover-lift">
                <div className="card-body p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-dollar-sign fa-2x text-primary"></i>
                  </div>
                  <h5 className="card-title">درآمد بالا</h5>
                  <p className="card-text text-muted">
                    با هر فروش، کمیسیون 10 تا 20 درصد دریافت کنید
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
              <div className="card border-0 shadow-sm h-100 text-center hover-lift">
                <div className="card-body p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-clock fa-2x text-success"></i>
                  </div>
                  <h5 className="card-title">زمان انعطاف‌پذیر</h5>
                  <p className="card-text text-muted">
                    در هر زمان و مکانی که می‌خواهید کار کنید
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
              <div className="card border-0 shadow-sm h-100 text-center hover-lift">
                <div className="card-body p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-graduation-cap fa-2x text-warning"></i>
                  </div>
                  <h5 className="card-title">آموزش رایگان</h5>
                  <p className="card-text text-muted">
                    دسترسی به آموزش‌های بازاریابی و فروش
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="400">
              <div className="card border-0 shadow-sm h-100 text-center hover-lift">
                <div className="card-body p-4">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style={{ width: '70px', height: '70px' }}>
                    <i className="fas fa-chart-bar fa-2x text-info"></i>
                  </div>
                  <h5 className="card-title">گزارش‌های دقیق</h5>
                  <p className="card-text text-muted">
                    مشاهده آمار فروش و درآمد خود به صورت لحظه‌ای
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-primary text-white text-center py-4">
                  <h3 className="mb-0">
                    <i className="fas fa-file-alt me-2"></i>
                    فرم درخواست عضویت
                  </h3>
                </div>
                <div className="card-body p-4 p-md-5">
                  <form onSubmit={handleSubmit}>
            {/* Personal Information */}
                    <div className="mb-5">
                      <h5 className="mb-4">
                        <i className="fas fa-user me-2 text-primary"></i>
                        اطلاعات شخصی
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            نام و نام خانوادگی <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                            className="form-control form-control-lg"
                            placeholder="نام کامل خود را وارد کنید"
                  />
                </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            شماره تماس <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                            className="form-control form-control-lg"
                            placeholder="09123456789"
                            dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
                    <div className="mb-5">
                      <h5 className="mb-4">
                        <i className="fas fa-briefcase me-2 text-primary"></i>
                        اطلاعات حرفه‌ای
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            سطح تجربه <span className="text-danger">*</span>
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    required
                            className="form-select form-select-lg"
                          >
                            <option value="beginner">مبتدی</option>
                            <option value="intermediate">متوسط</option>
                            <option value="advanced">پیشرفته</option>
                            <option value="expert">متخصص</option>
                  </select>
                </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            شغل فعلی
                  </label>
                  <input
                    type="text"
                    name="current_job"
                    value={formData.current_job}
                    onChange={handleChange}
                            className="form-control form-control-lg"
                            placeholder="مثال: بازاریاب دیجیتال"
                  />
                </div>
              </div>
            </div>

            {/* Interest and Motivation */}
                    <div className="mb-5">
                      <h5 className="mb-4">
                        <i className="fas fa-heart me-2 text-primary"></i>
                        علاقه‌مندی و انگیزه
                      </h5>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          حوزه مورد علاقه <span className="text-danger">*</span>
                  </label>
                  <select
                    name="interest_area"
                    value={formData.interest_area}
                    onChange={handleChange}
                    required
                          className="form-select form-select-lg"
                        >
                          <option value="medical">دوره‌های پزشکی و سلامت</option>
                          <option value="technology">دوره‌های تکنولوژی</option>
                          <option value="business">دوره‌های کسب و کار</option>
                          <option value="education">دوره‌های آموزشی</option>
                          <option value="all">همه موضوعات</option>
                  </select>
                </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          چرا می‌خواهید به تیم ما بپیوندید؟ <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    required
                    rows={4}
                          className="form-control"
                          placeholder="انگیزه و اهداف خود را برای ما بنویسید..."
                  />
                        <small className="form-text text-muted">
                          حداقل 50 کاراکتر
                        </small>
                </div>
                <div>
                        <label className="form-label fw-bold">
                          تجربه بازاریابی
                  </label>
                  <textarea
                    name="marketing_experience"
                    value={formData.marketing_experience}
                    onChange={handleChange}
                    rows={3}
                          className="form-control"
                          placeholder="تجربیات قبلی خود در زمینه بازاریابی را شرح دهید..."
                  />
              </div>
            </div>

            {/* Social Media */}
                    <div className="mb-5">
                      <h5 className="mb-4">
                        <i className="fas fa-share-alt me-2 text-primary"></i>
                        شبکه‌های اجتماعی (اختیاری)
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            <i className="fab fa-instagram me-2 text-danger"></i>
                            اینستاگرام
                  </label>
                  <input
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                            className="form-control form-control-lg"
                    placeholder="@username"
                            dir="ltr"
                  />
                </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">
                            <i className="fab fa-telegram me-2 text-info"></i>
                            تلگرام
                  </label>
                  <input
                    type="text"
                    name="telegram_handle"
                    value={formData.telegram_handle}
                    onChange={handleChange}
                            className="form-control form-control-lg"
                    placeholder="@username"
                            dir="ltr"
                  />
                </div>
              </div>
            </div>

            {error && (
                      <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                        <i className="fas fa-exclamation-triangle me-3"></i>
                        <div>{error}</div>
              </div>
            )}

                    <div className="d-flex gap-3 justify-content-end">
              <button
                type="button"
                onClick={() => router.push('/')}
                        className="btn btn-outline-secondary btn-lg px-5"
              >
                        <i className="fas fa-times me-2"></i>
                        انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                        className="btn btn-primary btn-lg px-5"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            ارسال درخواست
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
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="h1 mb-3">سوالات متداول</h2>
            <p className="lead text-muted">پاسخ سوالات رایج درباره عضویت در تیم بازاریابان</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      <i className="fas fa-question-circle me-2 text-primary"></i>
                      چگونه می‌توانم درآمد کسب کنم؟
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      با معرفی دوره‌های ما به دیگران و دریافت کد تخفیف اختصاصی، از هر فروش کمیسیون 10 تا 20 درصد دریافت می‌کنید.
                    </div>
                  </div>
                </div>
                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      <i className="fas fa-question-circle me-2 text-primary"></i>
                      چه زمانی درآمدم پرداخت می‌شود؟
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      درآمد شما به صورت ماهانه و تا پایان هر ماه واریز می‌شود.
                    </div>
                  </div>
                </div>
                <div className="accordion-item border-0 shadow-sm mb-3">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      <i className="fas fa-question-circle me-2 text-primary"></i>
                      آیا نیاز به تجربه قبلی دارم؟
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      خیر، هیچ تجربه قبلی لازم نیست. ما آموزش‌های لازم را به شما ارائه می‌دهیم.
                    </div>
                  </div>
                </div>
                <div className="accordion-item border-0 shadow-sm">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                      <i className="fas fa-question-circle me-2 text-primary"></i>
                      چند وقت طول می‌کشد تا درخواستم بررسی شود؟
                    </button>
                  </h2>
                  <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      معمولا ظرف 2 تا 3 روز کاری درخواست شما بررسی و نتیجه به شما اطلاع داده می‌شود.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
