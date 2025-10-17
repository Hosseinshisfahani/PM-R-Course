'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import AOSInitializer from './AOSInitializer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    // Only run effects for non-admin pages
    if (isAdminPage) {
      return;
    }

    // Navbar scroll effect
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

    // Smooth scrolling for anchor links (skip if target is sticky navbar)
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        // Only proceed if href is a valid selector (not just '#' or empty)
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            // Skip auto-scroll if target is the sticky navbar
            const navbar = document.getElementById('mainNavbar');
            if (target === navbar) {
              return;
            }
            
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdminPage]);

  // For admin pages, don't render the main site layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <AOSInitializer />
      <Navigation />
      
      {/* Main Content */}
      <main>
        {children}
      </main>

      <Footer />

      {/* Join Marketers Modal */}
      <div className="modal fade" id="joinMarketersModal" tabIndex={-1} aria-labelledby="joinMarketersModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}>
            <div className="modal-header" style={{ borderBottom: 'none', padding: '2rem 2rem 1rem' }}>
              <h5 className="modal-title" id="joinMarketersModalLabel" style={{ fontWeight: '700', color: 'var(--text-dark)' }}>
                <i className="fas fa-handshake text-success me-2"></i>
                به تیم فروشندگان ما بپیوندید
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 2rem 2rem' }}>
              <div className="text-center mb-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-coins fa-2x text-success"></i>
                </div>
                <h6 className="text-success mb-2">فرصت کسب درآمد</h6>
                <p className="text-muted">با پیوستن به تیم فروشندگان ما، می‌توانید از فروش دوره‌ها کمیسیون دریافت کنید</p>
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded-3">
                    <i className="fas fa-percentage fa-2x text-primary mb-2"></i>
                    <h6 className="mb-1">کمیسیون ۱۰٪</h6>
                    <small className="text-muted">از هر فروش</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-light rounded-3">
                    <i className="fas fa-gift fa-2x text-warning mb-2"></i>
                    <h6 className="mb-1">کد معرفی</h6>
                    <small className="text-muted">برای مشتریان</small>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-info" style={{ border: 'none', background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)' }}>
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle text-info me-2"></i>
                  <div>
                    <strong>نحوه پیوستن:</strong><br />
                    <small>برای پیوستن به تیم فروشندگان، با پشتیبانی تماس بگیرید یا درخواست خود را ارسال کنید.</small>
                  </div>
                </div>
              </div>
              
              <div className="d-grid gap-2">
                <a href="mailto:support@yasery.com?subject=درخواست پیوستن به تیم فروشندگان" className="btn btn-success btn-lg" style={{ borderRadius: '50px' }}>
                  <i className="fas fa-envelope me-2"></i>
                  ارسال درخواست
                </a>
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal" style={{ borderRadius: '50px' }}>
                  <i className="fas fa-times me-2"></i>
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}