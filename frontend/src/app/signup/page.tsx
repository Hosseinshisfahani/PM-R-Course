'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirm_password) {
      setError('رمز عبور و تکرار آن مطابقت ندارند.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      setLoading(false);
      return;
    }

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-5" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card border-0 shadow-lg text-center" style={{ borderRadius: '20px' }} data-aos="fade-up">
                <div className="card-body p-5">
                  <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-check fa-2x text-white"></i>
                  </div>
                  <h3 className="fw-bold text-success mb-3">ثبت‌نام موفق!</h3>
                  <p className="text-muted mb-4">
                    حساب کاربری شما با موفقیت ایجاد شد. در حال انتقال به صفحه اصلی...
                  </p>
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">در حال انتقال...</span>
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
    <div className="py-5" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }} data-aos="fade-up">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-user-plus fa-2x text-white"></i>
                  </div>
                  <h3 className="fw-bold text-primary">ثبت‌نام در آکادمی</h3>
                  <p className="text-muted">حساب کاربری جدید ایجاد کنید</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label">
                        <i className="fas fa-user me-2 text-primary"></i>
                        نام
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '10px' }}
                        placeholder="نام خود را وارد کنید"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label">
                        <i className="fas fa-user me-2 text-primary"></i>
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '10px' }}
                        placeholder="نام خانوادگی خود را وارد کنید"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-at me-2 text-primary"></i>
                      نام کاربری
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: '10px' }}
                      placeholder="نام کاربری خود را وارد کنید"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      ایمیل
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: '10px' }}
                      placeholder="ایمیل خود را وارد کنید"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-2 text-primary"></i>
                        رمز عبور
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '10px' }}
                        placeholder="رمز عبور خود را وارد کنید"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirm_password" className="form-label">
                        <i className="fas fa-lock me-2 text-primary"></i>
                        تکرار رمز عبور
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '10px' }}
                        placeholder="رمز عبور را مجدداً وارد کنید"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        با{' '}
                        <Link href="/terms" className="text-primary text-decoration-none">
                          قوانین و مقررات
                        </Link>
                        {' '}و{' '}
                        <Link href="/privacy" className="text-primary text-decoration-none">
                          حریم خصوصی
                        </Link>
                        {' '}موافقم
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3"
                    disabled={loading}
                    style={{ 
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        در حال ثبت‌نام...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        ثبت‌نام
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="text-center my-4">
                  <hr />
                  <span className="bg-white px-3 text-muted">یا</span>
                </div>

                {/* Social Signup */}
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" style={{ borderRadius: '50px' }}>
                    <i className="fab fa-google me-2"></i>
                    ثبت‌نام با گوگل
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-muted">
                    قبلاً ثبت‌نام کرده‌اید؟{' '}
                    <Link href="/login" className="text-primary fw-bold text-decoration-none">
                      وارد شوید
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-4">
              <Link href="/" className="btn btn-outline-light">
                <i className="fas fa-arrow-right me-2"></i>
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}