'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/lib/auth';

export default function Navigation() {
  const { user, logout, loading } = useAuth();
  const { canAccessMarketerFeatures, isAdmin } = useRole();
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      const navbar = document.getElementById('mainNavbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent hydration mismatch by not rendering user-dependent content until client-side
  if (!isClient) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light sticky-top" id="mainNavbar">
        <div className="container">
          <Link className="navbar-brand" href="/">
            <i className="fas fa-graduation-cap me-2"></i>
            آکادمی آقای استخوان
          </Link>
          
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" href="/">خانه</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/courses">دوره‌ها</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/about">درباره ما</Link>
              </li>
            </ul>
            
            <ul className="navbar-nav align-items-center">
              <li className="nav-item">
                <Link className="nav-link" href="/login">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  ورود
                </Link>
              </li>
              <li className="nav-item ms-2">
                <Link className="btn btn-primary" href="/signup">
                  <i className="fas fa-user-plus me-1"></i>
                  ثبت‌نام
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top" id="mainNavbar">
      <div className="container">
        <Link className="navbar-brand" href="/">
          <i className="fas fa-graduation-cap me-2"></i>
          آکادمی آقای استخوان
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">خانه</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/courses">دوره‌ها</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/about">درباره ما</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" href="/my-courses">دوره‌های من</Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                {/* Marketers Club */}
                {user.is_staff_member ? (
                  <li className="nav-item">
                    <Link className="nav-link d-flex align-items-center" href="/marketers/referral-codes" title="باشگاه فروشندگان">
                      <i className="fas fa-users fs-5 text-success"></i>
                      <span className="d-none d-xl-inline ms-2">باشگاه فروشندگان</span>
                    </Link>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Link className="btn btn-sm btn-outline-success d-flex align-items-center" href="/marketers/join" title="به تیم فروشندگان ما بپیوندید">
                      <i className="fas fa-handshake ms-1"></i>
                      <span className="d-none d-lg-inline">پیوستن به تیم بازاریابی</span>
                      <span className="d-lg-none">بپیوندید</span>
                    </Link>
                  </li>
                )}
                
                {/* Cart */}
                <li className="nav-item ms-3">
                  <Link className="nav-link position-relative" href="/cart" title="سبد خرید">
                    <i className="fas fa-shopping-cart fs-5"></i>
                    {cartCount > 0 && (
                      <span 
                        id="cart-count" 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                        style={{ fontSize: '0.7rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                
                {/* User Menu */}
                <li className="nav-item dropdown ms-2">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    {user.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        className="rounded-circle" 
                        width="40" 
                        height="40" 
                        style={{ objectFit: 'cover' }}
                        alt="Profile"
                      />
                    ) : (
                      <div 
                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="fas fa-user text-white"></i>
                      </div>
                    )}
                    <span className="d-none d-lg-inline ms-2">{user.first_name || user.username}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold">{user.first_name || user.username}</div>
                      <small className="text-muted">{user.email}</small>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/profile">
                        <i className="fas fa-user me-2"></i>پروفایل
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/my-courses">
                        <i className="fas fa-graduation-cap me-2"></i>دوره‌های من
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/purchase-history">
                        <i className="fas fa-history me-2"></i>تاریخچه خرید
                      </Link>
                    </li>
                    {canAccessMarketerFeatures && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li className="px-3 py-1">
                          <small className="text-muted fw-bold">پنل بازاریاب</small>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/marketers/referral-codes">
                            <i className="fas fa-gift me-2"></i>کدهای معرفی
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/marketers/commissions">
                            <i className="fas fa-coins me-2"></i>کمیسیون‌ها
                          </Link>
                        </li>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li className="px-3 py-1">
                          <small className="text-muted fw-bold">پنل مدیریت</small>
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin">
                            <i className="fas fa-crown me-2"></i>پنل مدیریت
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>خروج
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    ورود
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-primary" href="/signup">
                    <i className="fas fa-user-plus me-1"></i>
                    ثبت‌نام
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
