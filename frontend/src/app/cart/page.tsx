'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    price: number;
    discount_price?: number;
    thumbnail?: string;
  };
  quantity: number;
  added_at: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  total: number;
  referral_discount?: number;
  referral_code?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [removingItem, setRemovingItem] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cart/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        if (data.referral_code) {
          setReferralCode(data.referral_code);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setRemovingItem(itemId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cart/items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        console.error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const applyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    try {
      setApplyingReferral(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/referral/apply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify({ code: referralCode }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        const error = await response.json();
        alert(error.message || 'خطا در اعمال کد معرفی');
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      alert('خطا در اعمال کد معرفی');
    } finally {
      setApplyingReferral(false);
    }
  };

  const removeReferralCode = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/referral/apply/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
        setReferralCode('');
      }
    } catch (error) {
      console.error('Error removing referral code:', error);
    }
  };

  const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
  };

  if (!user) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">لطفاً وارد شوید</h4>
          <p className="text-muted">برای مشاهده سبد خرید خود باید وارد حساب کاربری شوید.</p>
          <Link href="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt me-2"></i>
            ورود
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3">در حال بارگذاری سبد خرید...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">سبد خرید شما خالی است</h4>
          <p className="text-muted">دوره‌های مورد نظر خود را به سبد خرید اضافه کنید.</p>
          <Link href="/courses" className="btn btn-primary">
            <i className="fas fa-search me-2"></i>
            مشاهده دوره‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 mb-0">
              <i className="fas fa-shopping-cart text-primary me-2"></i>
              سبد خرید
            </h1>
            <p className="text-muted">دوره‌های انتخاب شده خود را بررسی کنید</p>
          </div>
        </div>

        <div className="row">
          {/* Cart Items */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" data-aos="fade-up">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-list text-primary me-2"></i>
                  دوره‌های انتخاب شده ({cart.items.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {cart.items.map((item) => (
                  <div key={item.id} className="border-bottom p-4">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        {item.course.thumbnail ? (
                          <img 
                            src={item.course.thumbnail} 
                            className="img-fluid rounded" 
                            alt={item.course.title}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                        ) : (
                          <img 
                            src="/static/images/courses_background_medical.jpg" 
                            className="img-fluid rounded" 
                            alt={item.course.title}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div className="col-md-6">
                        <h6 className="mb-1">
                          <Link 
                            href={`/courses/${item.course.slug}`} 
                            className="text-decoration-none text-dark"
                          >
                            {item.course.title}
                          </Link>
                        </h6>
                        <small className="text-muted">
                          اضافه شده در: {new Date(item.added_at).toLocaleDateString('fa-IR')}
                        </small>
                      </div>
                      <div className="col-md-2 text-center">
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="badge bg-secondary me-2">تعداد: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="col-md-2 text-end">
                        <div className="fw-bold text-primary">
                          {item.course.discount_price ? (
                            <>
                              <div className="text-muted text-decoration-line-through small">
                                {item.course.price.toLocaleString()} تومان
                              </div>
                              <div>
                                {item.course.discount_price.toLocaleString()} تومان
                              </div>
                            </>
                          ) : (
                            <div>{item.course.price.toLocaleString()} تومان</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12 text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={removingItem === item.id}
                        >
                          {removingItem === item.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              در حال حذف...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash me-1"></i>
                              حذف از سبد خرید
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }} data-aos="fade-left">
              <div className="card-header bg-transparent border-0">
                <h5 className="mb-0">
                  <i className="fas fa-receipt text-primary me-2"></i>
                  خلاصه سفارش
                </h5>
              </div>
              <div className="card-body">
                {/* Referral Code */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="fas fa-gift text-success me-2"></i>
                    کد معرفی
                  </h6>
                  {cart.referral_code ? (
                    <div className="alert alert-success">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className="fas fa-check-circle me-2"></i>
                          <strong>{cart.referral_code}</strong>
                          <div className="small text-muted">
                            تخفیف: {cart.referral_discount?.toLocaleString()} تومان
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={removeReferralCode}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={applyReferralCode}>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="کد معرفی خود را وارد کنید"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          style={{ borderRadius: '10px 0 0 10px' }}
                        />
                        <button
                          className="btn btn-success"
                          type="submit"
                          disabled={applyingReferral || !referralCode.trim()}
                          style={{ borderRadius: '0 10px 10px 0' }}
                        >
                          {applyingReferral ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>جمع کل:</span>
                    <span>{cart.subtotal.toLocaleString()} تومان</span>
                  </div>
                  
                  {cart.referral_discount && cart.referral_discount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>تخفیف کد معرفی:</span>
                      <span>-{cart.referral_discount.toLocaleString()} تومان</span>
                    </div>
                  )}
                  
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>مبلغ نهایی:</span>
                    <span className="text-primary">{cart.total.toLocaleString()} تومان</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="d-grid mt-4">
                  <Link 
                    href="/checkout" 
                    className="btn btn-primary btn-lg"
                    style={{ 
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    ادامه فرآیند خرید
                  </Link>
                </div>

                {/* Continue Shopping */}
                <div className="text-center mt-3">
                  <Link href="/courses" className="btn btn-outline-primary">
                    <i className="fas fa-plus me-2"></i>
                    افزودن دوره بیشتر
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}