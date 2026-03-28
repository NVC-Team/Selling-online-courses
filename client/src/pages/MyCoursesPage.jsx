import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { FiPlay, FiBookOpen } from 'react-icons/fi';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(data => setEnrollments(data.enrollments))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Khóa học của tôi</h1>
          <p className="page-subtitle">Các khóa học bạn đã đăng ký</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state">
            <FiBookOpen style={{ fontSize: '4rem', opacity: 0.3 }} />
            <h3>Chưa có khóa học nào</h3>
            <p>Hãy khám phá và đăng ký khóa học đầu tiên</p>
            <Link to="/courses" className="btn btn-primary">Khám phá khóa học</Link>
          </div>
        ) : (
          <div className="course-grid">
            {enrollments.map(e => (
              <div key={e.id} className="course-card">
                <div className="course-card-thumbnail">
                  {e.thumbnail ? (
                    <img src={`http://localhost:5000${e.thumbnail}`} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <span>📚</span>}
                </div>
                <div className="course-card-body">
                  <span className="course-card-category">{e.category || 'Chung'}</span>
                  <h3 className="course-card-title">{e.title}</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tiến độ</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{e.progress_percent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${e.progress_percent}%` }}></div>
                    </div>
                  </div>
                  <div className="course-card-meta">
                    <span>📖 {e.total_lectures} bài</span>
                    <span>⏱️ {e.total_duration}p</span>
                  </div>
                  <div className="course-card-footer">
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.instructor_name}</span>
                    <Link to={`/learn/${e.course_id}`} className="btn btn-primary btn-sm">
                      <FiPlay /> Học tiếp
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
