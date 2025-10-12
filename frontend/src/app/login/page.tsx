'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
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

    try {
      await login(formData.username, formData.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'خطا در ورود. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }} data-aos="fade-up">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-graduation-cap fa-2x text-white"></i>
                  </div>
                  <h3 className="fw-bold text-primary">ورود به آکادمی</h3>
                  <p className="text-muted">به حساب کاربری خود وارد شوید</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-user me-2 text-primary"></i>
                      نام کاربری یا ایمیل
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
                      placeholder="نام کاربری یا ایمیل خود را وارد کنید"
                    />
                  </div>

                  <div className="mb-4">
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

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        مرا به خاطر بسپار
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-primary text-decoration-none">
                      فراموشی رمز عبور؟
                    </Link>
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
                        در حال ورود...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        ورود
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="text-center my-4">
                  <hr />
                  <span className="bg-white px-3 text-muted">یا</span>
                </div>

                {/* Social Login */}
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary" style={{ borderRadius: '50px' }}>
                    <i className="fab fa-google me-2"></i>
                    ورود با گوگل
                  </button>
                </div>

                {/* Signup Link */}
                <div className="text-center mt-4">
                  <p className="text-muted">
                    حساب کاربری ندارید؟{' '}
                    <Link href="/signup" className="text-primary fw-bold text-decoration-none">
                      ثبت‌نام کنید
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