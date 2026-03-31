import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { FiBookOpen, FiUsers, FiDollarSign, FiPlus, FiCreditCard } from 'react-icons/fi';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  useEffect(() => {
    courseAPI.getInstructorCourses()
      .then(data => setCourses(data.courses))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + (c.student_count || 0), 0);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.total_revenue || 0), 0);

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">Bảng điều khiển giảng viên</h1>
            <p className="page-subtitle">Quản lý khóa học và học viên</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/instructor/payments" className="btn btn-secondary">
              <FiCreditCard /> Xác nhận thanh toán
            </Link>
            <Link to="/instructor/courses" className="btn btn-primary">
              <FiPlus /> Quản lý khóa học
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}><FiBookOpen /></div>
            <div className="stat-card-value">{courses.length}</div>
            <div className="stat-card-label">Khóa học</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}><FiUsers /></div>
            <div className="stat-card-value">{totalStudents}</div>
            <div className="stat-card-label">Học viên</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00' }}><FiDollarSign /></div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{formatPrice(totalRevenue)}</div>
            <div className="stat-card-label">Doanh thu</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Khóa học của bạn</h2>
            {courses.length === 0 ? (
              <div className="empty-state">
                <FiBookOpen style={{ fontSize: '4rem', opacity: 0.3 }} />
                <h3>Chưa có khóa học nào</h3>
                <p>Tạo khóa học đầu tiên để bắt đầu giảng dạy</p>
                <Link to="/instructor/courses" className="btn btn-primary"><FiPlus /> Tạo khóa học</Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Khóa học</th>
                      <th>Học viên</th>
                      <th>Doanh thu</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.category} • {c.total_lectures} bài giảng</div>
                        </td>
                        <td>{c.student_count}</td>
                        <td>{formatPrice(c.total_revenue)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Link to={`/instructor/courses/${c.id}/lectures`} className="btn btn-secondary btn-sm">Bài giảng</Link>
                            <Link to={`/instructor/courses/${c.id}/students`} className="btn btn-secondary btn-sm">Học viên</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
