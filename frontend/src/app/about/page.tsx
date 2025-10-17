'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  specialties: string[];
  experience: string;
  education: string;
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading team data
    setTimeout(() => {
      setTeamMembers([
        {
          id: 1,
          name: 'دکتر احمد استخوان',
          position: 'بنیان‌گذار و مدیر ارشد',
          bio: 'متخصص استئوپاتی با بیش از ۱۵ سال تجربه در درمان و آموزش',
          image: '/static/images/team/ahmad.jpg',
          specialties: ['استئوپاتی', 'طب فیزیکی', 'درمان دستی'],
          experience: '۱۵ سال',
          education: 'دکترای استئوپاتی از دانشگاه تهران'
        },
        {
          id: 2,
          name: 'دکتر مریم درمانگر',
          position: 'مشاور آموزشی',
          bio: 'متخصص آموزش پزشکی و توسعه محتوای آموزشی',
          image: '/static/images/team/maryam.jpg',
          specialties: ['آموزش پزشکی', 'توسعه محتوا', 'روش‌شناسی'],
          experience: '۱۲ سال',
          education: 'دکترای آموزش پزشکی از دانشگاه علوم پزشکی'
        },
        {
          id: 3,
          name: 'مهندس علی تکنولوژی',
          position: 'مدیر فناوری',
          bio: 'متخصص فناوری‌های آموزشی و پلتفرم‌های آنلاین',
          image: '/static/images/team/ali.jpg',
          specialties: ['تکنولوژی آموزشی', 'پلتفرم‌های آنلاین', 'UX/UI'],
          experience: '۱۰ سال',
          education: 'کارشناسی ارشد مهندسی نرم‌افزار'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      number: '۵۰۰+',
      label: 'دانشجوی فعال',
      icon: 'fas fa-users'
    },
    {
      number: '۱۵+',
      label: 'سال تجربه',
      icon: 'fas fa-calendar-alt'
    },
    {
      number: '۵۰+',
      label: 'دوره آموزشی',
      icon: 'fas fa-graduation-cap'
    },
    {
      number: '۹۸٪',
      label: 'رضایت دانشجویان',
      icon: 'fas fa-star'
    }
  ];

  const values = [
    {
      icon: 'fas fa-heart',
      title: 'تعهد به کیفیت',
      description: 'ما متعهد به ارائه بالاترین کیفیت آموزش و خدمات هستیم'
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'نوآوری',
      description: 'همیشه در جستجوی روش‌های جدید و بهتر برای آموزش هستیم'
    },
    {
      icon: 'fas fa-handshake',
      title: 'اعتماد',
      description: 'اعتماد دانشجویان ما بزرگترین سرمایه ماست'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'توسعه',
      description: 'ما به رشد و توسعه مداوم دانشجویان متعهدیم'
    }
  ];

  const achievements = [
    {
      year: '۱۴۰۳',
      title: 'راه‌اندازی آکادمی آنلاین',
      description: 'شروع فعالیت با هدف آموزش استئوپاتی به صورت آنلاین'
    },
    {
      year: '۱۴۰۲',
      title: 'توسعه پلتفرم آموزشی',
      description: 'طراحی و پیاده‌سازی سیستم مدیریت یادگیری پیشرفته'
    },
    {
      year: '۱۴۰۱',
      title: 'همکاری با متخصصان',
      description: 'تشکیل تیم متخصصان استئوپاتی و آموزش پزشکی'
    },
    {
      year: '۱۴۰۰',
      title: 'تحقیق و توسعه',
      description: 'شروع تحقیقات در زمینه آموزش آنلاین استئوپاتی'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="hero-content">
                <h1 className="hero-title">
                  <i className="fas fa-university me-3 text-primary"></i>
                  درباره آکادمی آقای استخوان
                </h1>
                <p className="hero-subtitle">
                  ما متخصصان استئوپاتی هستیم که با بیش از ۱۵ سال تجربه، 
                  بهترین آموزش‌های حرفه‌ای را در اختیار شما قرار می‌دهیم.
                </p>
                <div className="hero-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span>آموزش‌های تخصصی و کاربردی</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span>تیم متخصص و با تجربه</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    <span>پشتیبانی ۲۴/۷</span>
                  </div>
                </div>
                <div className="hero-actions">
                  <Link href="/courses" className="btn btn-primary btn-lg me-3">
                    <i className="fas fa-book me-2"></i>
                    مشاهده دوره‌ها
                  </Link>
                  <Link href="#contact" className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-phone me-2"></i>
                    تماس با ما
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <div className="hero-image">
                <div className="academy-card">
                  <div className="card-header">
                    <div className="academy-logo">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="academy-info">
                      <h3>آکادمی آقای استخوان</h3>
                      <p>مرکز تخصصی آموزش استئوپاتی</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mission-statement">
                      <h4>ماموریت ما</h4>
                      <p>
                        ارائه آموزش‌های تخصصی و کاربردی استئوپاتی به دانشجویان 
                        و متخصصان علاقه‌مند، با استفاده از جدیدترین روش‌های آموزشی 
                        و تکنولوژی‌های روز دنیا.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4" data-aos="fade-right">
              <div className="mission-card">
                <div className="card-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3 className="card-title">ماموریت ما</h3>
                <p className="card-description">
                  ما متعهد به ارائه آموزش‌های تخصصی و کاربردی استئوپاتی هستیم 
                  که دانشجویان را برای ورود به بازار کار آماده می‌کند. هدف ما 
                  تربیت متخصصان ماهر و با تجربه در زمینه استئوپاتی است.
                </p>
                <ul className="mission-points">
                  <li><i className="fas fa-check me-2"></i>آموزش‌های تخصصی و عملی</li>
                  <li><i className="fas fa-check me-2"></i>استفاده از جدیدترین روش‌ها</li>
                  <li><i className="fas fa-check me-2"></i>پشتیبانی مداوم دانشجویان</li>
                  <li><i className="fas fa-check me-2"></i>گواهی‌نامه‌های معتبر</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 mb-4" data-aos="fade-left">
              <div className="vision-card">
                <div className="card-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="card-title">چشم‌انداز ما</h3>
                <p className="card-description">
                  ما می‌خواهیم به بزرگترین مرکز آموزش استئوپاتی در منطقه تبدیل شویم 
                  و با تربیت متخصصان ماهر، سهمی در بهبود سلامت جامعه داشته باشیم.
                </p>
                <ul className="vision-points">
                  <li><i className="fas fa-star me-2"></i>مرجع آموزش استئوپاتی</li>
                  <li><i className="fas fa-star me-2"></i>توسعه آموزش آنلاین</li>
                  <li><i className="fas fa-star me-2"></i>همکاری با دانشگاه‌ها</li>
                  <li><i className="fas fa-star me-2"></i>توسعه بین‌المللی</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">ارزش‌های ما</h2>
            <p className="section-subtitle">اصولی که بر اساس آن فعالیت می‌کنیم</p>
          </div>
          
          <div className="row">
            {values.map((value, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="value-card">
                  <div className="value-icon">
                    <i className={value.icon}></i>
                  </div>
                  <h4 className="value-title">{value.title}</h4>
                  <p className="value-description">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">تیم ما</h2>
            <p className="section-subtitle">متخصصان با تجربه و ماهر</p>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
              <p className="mt-3">در حال بارگذاری تیم...</p>
            </div>
          ) : (
            <div className="row">
              {teamMembers.map((member, index) => (
                <div key={member.id} className="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="team-card">
                    <div className="member-image">
                      <div className="image-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    <div className="member-info">
                      <h4 className="member-name">{member.name}</h4>
                      <p className="member-position">{member.position}</p>
                      <p className="member-bio">{member.bio}</p>
                      <div className="member-details">
                        <div className="detail-item">
                          <i className="fas fa-briefcase me-2"></i>
                          <span>{member.experience} تجربه</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-graduation-cap me-2"></i>
                          <span>{member.education}</span>
                        </div>
                      </div>
                      <div className="member-specialties">
                        {member.specialties.map((specialty, idx) => (
                          <span key={idx} className="specialty-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="achievements-section py-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">دستاوردهای ما</h2>
            <p className="section-subtitle">مسیر رشد و توسعه آکادمی</p>
          </div>
          
          <div className="timeline">
            {achievements.map((achievement, index) => (
              <div key={index} className="timeline-item" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="timeline-marker">
                  <div className="marker-dot"></div>
                </div>
                <div className="timeline-content">
                  <div className="timeline-year">{achievement.year}</div>
                  <h4 className="timeline-title">{achievement.title}</h4>
                  <p className="timeline-description">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card" data-aos="fade-up">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3 className="cta-title">آماده شروع یادگیری هستید؟</h3>
                <p className="cta-description">
                  همین حالا به خانواده بزرگ آکادمی آقای استخوان بپیوندید 
                  و مسیر حرفه‌ای خود را آغاز کنید
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link href="/courses" className="btn btn-primary btn-lg">
                  <i className="fas fa-rocket me-2"></i>
                  شروع یادگیری
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          background: #f8f9fa;
        }

        .about-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .about-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
                      linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), 
                      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          opacity: 0.3;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-features {
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .academy-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }

        .academy-logo {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1.5rem;
          font-size: 2rem;
        }

        .academy-info h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .academy-info p {
          margin: 0;
          opacity: 0.8;
          font-size: 1rem;
        }

        .mission-statement h4 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: white;
        }

        .mission-statement p {
          line-height: 1.6;
          opacity: 0.9;
        }

        .stats-section {
          background: white;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .mission-vision-section {
          background: #f8f9fa;
        }

        .mission-card,
        .vision-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          height: 100%;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          color: white;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .card-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .mission-points,
        .vision-points {
          list-style: none;
          padding: 0;
        }

        .mission-points li,
        .vision-points li {
          padding: 0.5rem 0;
          color: #666;
        }

        .mission-points i {
          color: #28a745;
        }

        .vision-points i {
          color: #ffc107;
        }

        .values-section {
          background: white;
        }

        .value-card {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          height: 100%;
        }

        .value-card:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-5px);
        }

        .value-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: white;
        }

        .value-card:hover .value-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .value-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .value-description {
          line-height: 1.6;
        }

        .team-section {
          background: #f8f9fa;
        }

        .team-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .team-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .member-image {
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }

        .member-info {
          padding: 1.5rem;
        }

        .member-name {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .member-position {
          color: #667eea;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .member-bio {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .member-details {
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .member-specialties {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .specialty-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
        }

        .achievements-section {
          background: white;
        }

        .timeline {
          position: relative;
          padding: 2rem 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
        }

        .timeline-item:nth-child(odd) {
          flex-direction: row-reverse;
        }

        .timeline-marker {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }

        .marker-dot {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }

        .timeline-content {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          width: 45%;
          position: relative;
        }

        .timeline-item:nth-child(odd) .timeline-content {
          margin-left: auto;
        }

        .timeline-item:nth-child(even) .timeline-content {
          margin-right: auto;
        }

        .timeline-year {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .timeline-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .timeline-description {
          color: #666;
          line-height: 1.6;
        }

        .cta-section {
          background: #f8f9fa;
        }

        .cta-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-description {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .timeline::before {
            left: 20px;
          }
          
          .timeline-marker {
            left: 20px;
          }
          
          .timeline-content {
            width: calc(100% - 60px);
            margin-left: 60px !important;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
