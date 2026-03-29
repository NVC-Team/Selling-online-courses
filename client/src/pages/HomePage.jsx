import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { FiArrowRight, FiUsers, FiBookOpen, FiAward, FiSearch, FiPlay, FiStar, FiCheckCircle } from 'react-icons/fi';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
}
export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getAll({ limit: 6 })
      .then(data => setCourses(data.courses))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const levelText = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

  const features = [
    { icon: <FiPlay />, title: 'Video chất lượng HD', desc: 'Bài giảng được quay với chất lượng cao, rõ ràng và dễ hiểu', color: '#e879a8' },
    { icon: <FiCheckCircle />, title: 'Chứng chỉ hoàn thành', desc: 'Nhận chứng chỉ sau khi hoàn thành khóa học', color: '#34d399' },
    { icon: <FiStar />, title: 'Giảng viên uy tín', desc: 'Đội ngũ giảng viên giàu kinh nghiệm trong ngành', color: '#fbbf24' },
    { icon: <FiUsers />, title: 'Cộng đồng lớn', desc: 'Kết nối với hàng ngàn học viên cùng đam mê', color: '#c084fc' },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Nâng tầm kiến thức<br />với EduPlatform</h1>
          <p className="hero-subtitle">
            Khám phá hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu. 
            Học mọi lúc, mọi nơi với video bài giảng sinh động.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">
              <FiSearch /> Khám phá khóa học
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Đăng ký miễn phí <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 0 60px' }}>
        <div className="container">
          <div className="stats-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(232, 121, 168, 0.1)', color: '#e879a8', margin: '0 auto 16px' }}>
                <FiBookOpen />
              </div>
              <div className="stat-card-value">100+</div>
              <div className="stat-card-label">Khóa học</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', margin: '0 auto 16px' }}>
                <FiUsers />
              </div>
              <div className="stat-card-value">5,000+</div>
              <div className="stat-card-label">Học viên</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', margin: '0 auto 16px' }}>
                <FiAward />
              </div>
              <div className="stat-card-value">50+</div>
              <div className="stat-card-label">Giảng viên</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Tại sao chọn EduPlatform?</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>Nền tảng học trực tuyến hiện đại với đầy đủ tính năng hỗ trợ</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: '28px', textAlign: 'center', cursor: 'default' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
                  background: `${f.color}15`, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', margin: '0 auto 16px'
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Khóa học nổi bật</h2>
              <p style={{ color: 'var(--text-muted)' }}>Các khóa học được yêu thích nhất</p>
            </div>
            <Link to="/courses" className="btn btn-outline">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="course-grid">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-thumbnail"></div>
                  <div style={{ padding: '16px 20px' }}>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short" style={{ marginTop: '16px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="course-grid">
              {courses.map(course => (
                <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none' }}>
                  <div className="course-card">
                    <div className="course-card-thumbnail">
                      {(() => {
                        const ytId = getYouTubeId(course.intro_video_url);
                        if (ytId) return <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                        if (course.thumbnail) return <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                        return <span>📚</span>;
                      })()}
                    </div>
                    <div className="course-card-body">
                      <span className="course-card-category">{course.category || 'Chung'}</span>
                      <h3 className="course-card-title">{course.title}</h3>
                      <p className="course-card-desc">{course.description}</p>
                      <div className="course-card-meta">
                        <span>📖 {course.total_lectures} bài giảng</span>
                        <span>⏱️ {course.total_duration} phút</span>
                        <span className={`badge level-${course.level}`}>{levelText[course.level]}</span>
                      </div>
                      <div className="course-card-footer">
                        <span className="course-card-price">{formatPrice(course.price)}</span>
                        <div className="course-card-instructor">
                          <div className="course-card-instructor-avatar">
                            {course.instructor_name?.charAt(0)}
                          </div>
                          {course.instructor_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(232, 121, 168, 0.08), rgba(192, 132, 252, 0.05))',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Sẵn sàng bắt đầu học?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', fontSize: '1.05rem' }}>
            Tham gia cùng hàng ngàn học viên và nâng cao kỹ năng ngay hôm nay.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <FiArrowRight /> Bắt đầu miễn phí
            </Link>
            <Link to="/courses" className="btn btn-secondary btn-lg">
              Xem khóa học
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
