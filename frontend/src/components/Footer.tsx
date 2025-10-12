import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="mb-3">
              <i className="fas fa-graduation-cap me-2"></i>
              آکادمی آقای استخوان
            </h5>
            <p className="mb-3">بهترین دوره‌های آموزشی پزشکی را با ما تجربه کنید. ما متعهد به ارائه آموزش‌های با کیفیت و کاربردی هستیم.</p>
            <div className="social-links">
              <a href="#" title="تلگرام"><i className="fab fa-telegram"></i></a>
              <a href="#" title="اینستاگرام"><i className="fab fa-instagram"></i></a>
              <a href="#" title="لینکدین"><i className="fab fa-linkedin"></i></a>
              <a href="#" title="یوتیوب"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">دوره‌ها</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link href="/courses">همه دوره‌ها</Link></li>
              <li className="mb-2"><a href="#">دوره‌های رایگان</a></li>
              <li className="mb-2"><a href="#">دوره‌های ویژه</a></li>
              <li className="mb-2"><a href="#">دوره‌های جدید</a></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">پشتیبانی</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#">راهنمای استفاده</a></li>
              <li className="mb-2"><a href="#">سوالات متداول</a></li>
              <li className="mb-2"><a href="#">تماس با ما</a></li>
              <li className="mb-2"><a href="#">گزارش مشکل</a></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">قوانین</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#">قوانین و مقررات</a></li>
              <li className="mb-2"><a href="#">حریم خصوصی</a></li>
              <li className="mb-2"><a href="#">شرایط استفاده</a></li>
              <li className="mb-2"><a href="#">بازپرداخت</a></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">تماس</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                <a href="tel:+989123456789">۰۹۱۲۳۴۵۶۷۸۹</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                <a href="mailto:info@yasery.com">info@yasery.com</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                تهران، ایران
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">&copy; ۱۴۰۳ آکادمی آقای استخوان. تمامی حقوق محفوظ است.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              طراحی شده با <i className="fas fa-heart text-danger"></i> توسط{' '}
              <a 
                href="https://t.me/py_isfahani" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '600' }}
              >
                حسین
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
