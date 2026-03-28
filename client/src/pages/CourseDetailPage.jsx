import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiClock, FiBookOpen, FiUsers, FiPlay, FiLock, FiShoppingCart, FiCheck } from 'react-icons/fi';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const levelText = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

  useEffect(() => {
    courseAPI.getCourseById(id)
      .then(data => {
        setCourse(data.course);
        setLectures(data.lectures || []);
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      enrollmentAPI.getMyEnrollments()
        .then(data => {
          const isEnrolled = data.enrollments.some(e => e.course_id === parseInt(id));
          setEnrolled(isEnrolled);
        })
        .catch(() => {});
    }
  }, [user, id]);

  if (loading) return <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (!course) return null;

  const isOwner = user && course.instructor_id === user.id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/courses">Khóa học</Link>
          <span>/</span>
          <span>{course.title}</span>
        </div>

        <div className="course-detail-grid">
          {/* Main Content */}
          <div>
            <span className={`badge level-${course.level}`} style={{ marginBottom: '12px' }}>{levelText[course.level]}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.3 }}>{course.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="course-card-instructor">
                <div className="course-card-instructor-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                  {course.instructor_name?.charAt(0)}
                </div>
                <span>{course.instructor_name}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUsers /> {course.student_count} học viên
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiBookOpen /> {course.total_lectures} bài giảng
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiClock /> {course.total_duration} phút
              </span>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Mô tả khóa học</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{course.description}</p>
            </div>

            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
                Nội dung khóa học ({lectures.length} bài giảng)
              </h2>
              <div className="lecture-list" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
                {lectures.map((lecture, idx) => (
                  <div key={lecture.id} className="lecture-item" style={{ cursor: 'default' }}>
                    <div className="lecture-number">{idx + 1}</div>
                    <div className="lecture-info">
                      <h4>{lecture.title}</h4>
                      <span>{lecture.duration} phút</span>
                    </div>
                    {lecture.is_free ? (
                      <span className="badge badge-success"><FiPlay /> Miễn phí</span>
                    ) : (
                      <FiLock style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card">
              <div style={{ height: '200px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                {course.thumbnail ? (
                  <img src={`http://localhost:5000${course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📚'}
              </div>
              <div className="card-body">
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
                  <span className="course-card-price" style={{ fontSize: '2rem' }}>{formatPrice(course.price)}</span>
                </div>

                {enrolled ? (
                  <Link to={`/learn/${course.id}`} className="btn btn-success w-full btn-lg" style={{ marginBottom: '12px' }}>
                    <FiPlay /> Tiếp tục học
                  </Link>
                ) : isOwner || isAdmin ? (
                  <Link to={`/instructor/courses/${course.id}/lectures`} className="btn btn-primary w-full btn-lg" style={{ marginBottom: '12px' }}>
                    Quản lý bài giảng
                  </Link>
                ) : (
                  <Link to={user ? `/payment/${course.id}` : '/login'} className="btn btn-primary w-full btn-lg" style={{ marginBottom: '12px' }}>
                    <FiShoppingCart /> {course.price > 0 ? 'Mua khóa học' : 'Đăng ký miễn phí'}
                  </Link>
                )}

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Cấp độ:</span><span>{levelText[course.level]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Số bài giảng:</span><span>{course.total_lectures}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Thời lượng:</span><span>{course.total_duration} phút</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span>Học viên:</span><span>{course.student_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
