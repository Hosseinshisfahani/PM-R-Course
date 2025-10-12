'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Purchase {
  id: string;
  purchase_type: string;
  course?: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
  };
  section?: {
    id: number;
    title: string;
    course_title: string;
    course_slug: string;
  };
  amount: number;
  original_amount?: number;
  discount_amount?: number;
  payment_status: string;
  payment_method?: string;
  transaction_id?: string;
  referral_code?: {
    code: string;
    discount_percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export default function PurchaseHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchPurchases();
    }
  }, [user, authLoading, router]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/purchases/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases || data || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'refunded': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'پرداخت شده';
      case 'pending': return 'در انتظار پرداخت';
      case 'failed': return 'ناموفق';
      case 'refunded': return 'بازگردانده شده';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'fa-check-circle';
      case 'pending': return 'fa-clock';
      case 'failed': return 'fa-times-circle';
      case 'refunded': return 'fa-undo';
      default: return 'fa-question-circle';
    }
  };

  const getFilteredPurchases = () => {
    if (filter === 'completed') {
      return purchases.filter(p => p.payment_status === 'completed');
    }
    if (filter === 'pending') {
      return purchases.filter(p => p.payment_status === 'pending');
    }
    return purchases;
  };

  const filteredPurchases = getFilteredPurchases();

  const getTotalSpent = () => {
    return purchases
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  };

  const getTotalSaved = () => {
    return purchases
      .filter(p => p.payment_status === 'completed' && p.discount_amount)
      .reduce((sum, p) => sum + parseFloat((p.discount_amount || 0).toString()), 0);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="mt-3 text-muted">در حال بارگذاری تاریخچه خریدها...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="purchase-history-page bg-light min-vh-100">
      {/* Hero Header */}
      <section className="hero-gradient py-5 mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold text-white mb-3">
                <i className="fas fa-receipt me-3"></i>
                تاریخچه خرید
              </h1>
              <p className="lead text-white-50 mb-0">مشاهده تمام تراکنش‌ها و خریدهای شما</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="bg-white rounded-3 shadow p-4">
                <small className="d-block text-muted mb-2">مجموع خرید</small>
                <h2 className="mb-0 fw-bold text-primary">{getTotalSpent().toLocaleString()} <small className="text-muted">تومان</small></h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container pb-5">

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-shopping-bag fa-2x text-primary"></i>
                </div>
                <h4 className="fw-bold mb-1">{purchases.length}</h4>
                <p className="text-muted small mb-0">کل خریدها</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <h4 className="fw-bold mb-1">
                  {purchases.filter(p => p.payment_status === 'completed').length}
                </h4>
                <p className="text-muted small mb-0">موفق</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
                <h4 className="fw-bold mb-1">
                  {purchases.filter(p => p.payment_status === 'pending').length}
                </h4>
                <p className="text-muted small mb-0">در انتظار</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-piggy-bank fa-2x text-danger"></i>
                </div>
                <h4 className="fw-bold mb-1">{getTotalSaved().toLocaleString()}</h4>
                <p className="text-muted small mb-0">صرفه‌جویی (تومان)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4">
          <ul className="nav nav-pills justify-content-center bg-white rounded shadow-sm p-2">
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <i className="fas fa-list me-2"></i>
                همه ({purchases.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                <i className="fas fa-check me-2"></i>
                پرداخت شده ({purchases.filter(p => p.payment_status === 'completed').length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                <i className="fas fa-clock me-2"></i>
                در انتظار ({purchases.filter(p => p.payment_status === 'pending').length})
              </button>
            </li>
          </ul>
        </div>

        {/* Purchases List */}
        {filteredPurchases.length > 0 ? (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 p-3">شناسه تراکنش</th>
                          <th className="border-0 p-3">محصول</th>
                          <th className="border-0 p-3">مبلغ</th>
                          <th className="border-0 p-3">تخفیف</th>
                          <th className="border-0 p-3">وضعیت</th>
                          <th className="border-0 p-3">تاریخ</th>
                          <th className="border-0 p-3">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPurchases.map((purchase) => (
                          <tr key={purchase.id}>
                            <td className="p-3">
                              <div className="d-flex flex-column">
                                <span className="font-monospace small text-muted">
                                  #{purchase.id.substring(0, 8)}
                                </span>
                                {purchase.transaction_id && (
                                  <small className="text-muted">
                                    {purchase.transaction_id}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="d-flex align-items-center">
                                {purchase.course?.thumbnail && (
                                  <img 
                                    src={purchase.course.thumbnail} 
                                    alt={purchase.course.title}
                                    className="rounded me-3"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                )}
                                <div>
                                  {purchase.course ? (
                                    <>
                                      <div className="fw-bold">{purchase.course.title}</div>
                                      <small className="text-muted">
                                        <i className="fas fa-graduation-cap me-1"></i>
                                        دوره کامل
                                      </small>
                                    </>
                                  ) : purchase.section ? (
                                    <>
                                      <div className="fw-bold">{purchase.section.title}</div>
                                      <small className="text-muted">
                                        <i className="fas fa-book me-1"></i>
                                        {purchase.section.course_title}
                                      </small>
                                    </>
                                  ) : (
                                    <span className="text-muted">محصول نامشخص</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="d-flex flex-column">
                                <span className="fw-bold">
                                  {parseFloat(purchase.amount.toString()).toLocaleString()} تومان
                                </span>
                                {purchase.original_amount && purchase.original_amount !== purchase.amount && (
                                  <small className="text-muted text-decoration-line-through">
                                    {parseFloat(purchase.original_amount.toString()).toLocaleString()} تومان
                                  </small>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              {purchase.discount_amount && parseFloat(purchase.discount_amount.toString()) > 0 ? (
                                <div>
                                  <span className="badge bg-success">
                                    <i className="fas fa-tag me-1"></i>
                                    {parseFloat(purchase.discount_amount.toString()).toLocaleString()} تومان
                                  </span>
                                  {purchase.referral_code && (
                                    <div className="mt-1">
                                      <small className="text-muted">
                                        کد: {purchase.referral_code.code}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`badge bg-${getStatusColor(purchase.payment_status)}`}>
                                <i className={`fas ${getStatusIcon(purchase.payment_status)} me-1`}></i>
                                {getStatusText(purchase.payment_status)}
                              </span>
                            </td>
                            <td className="p-3">
                              <small className="text-muted">
                                <i className="fas fa-calendar-alt me-1"></i>
                                {new Date(purchase.created_at).toLocaleDateString('fa-IR')}
                                <div className="mt-1">
                                  {new Date(purchase.created_at).toLocaleTimeString('fa-IR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </small>
                            </td>
                            <td className="p-3">
                              {purchase.course && (
                                <Link 
                                  href={`/courses/${purchase.course.slug}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  مشاهده
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <div className="mb-4">
                  <i className="fas fa-receipt text-muted" style={{ fontSize: '5rem' }}></i>
                </div>
                <h3 className="mb-3">
                  {filter === 'all' && 'هنوز خریدی انجام نداده‌اید'}
                  {filter === 'completed' && 'خرید موفقی ثبت نشده است'}
                  {filter === 'pending' && 'خریدی در انتظار پرداخت نیست'}
                </h3>
                <p className="text-muted mb-4 lead">
                  دوره‌های آموزشی باکیفیت را کشف کنید و یادگیری خود را شروع کنید
                </p>
                <Link href="/courses" className="btn btn-primary btn-lg">
                  <i className="fas fa-search me-2"></i>
                  مشاهده دوره‌ها
                </Link>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .hero-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
          }

          .nav-pills .nav-link {
            color: #6c757d;
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            margin: 0 0.25rem;
          }

          .nav-pills .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .nav-pills .nav-link:hover:not(.active) {
            background-color: #f8f9fa;
          }

          .table tbody tr {
            transition: all 0.2s ease;
          }

          .table tbody tr:hover {
            background-color: #f8f9fa;
          }

          @media (max-width: 768px) {
            .table {
              font-size: 0.875rem;
            }
            
            .table td, .table th {
              padding: 0.75rem 0.5rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

