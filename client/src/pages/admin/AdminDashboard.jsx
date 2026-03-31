import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiUsers, FiBookOpen, FiDollarSign, FiClock, FiCheckCircle, FiUserPlus } from 'react-icons/fi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  const { stats, recentUsers, recentCourses } = data;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Bảng quản trị</h1>
          <p className="page-subtitle">Tổng quan hệ thống</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}><FiUsers /></div>
            <div className="stat-card-value">{stats.totalUsers}</div>
            <div className="stat-card-label">Người dùng</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}><FiBookOpen /></div>
            <div className="stat-card-value">{stats.totalCourses}</div>
            <div className="stat-card-label">Tổng khóa học</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00' }}><FiClock /></div>
            <div className="stat-card-value">{stats.pendingCourses}</div>
            <div className="stat-card-label">Chờ duyệt</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#00e676' }}><FiDollarSign /></div>
            <div className="stat-card-value" style={{ fontSize: '1.2rem' }}>{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-card-label">Tổng doanh thu</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <Link to="/admin/courses" className="btn btn-primary"><FiCheckCircle /> Duyệt khóa học ({stats.pendingCourses})</Link>
          <Link to="/admin/users" className="btn btn-secondary"><FiUsers /> Quản lý người dùng</Link>
          <Link to="/admin/revenue" className="btn btn-secondary"><FiDollarSign /> Xem doanh thu</Link>
        </div>

        <div className="admin-two-col">
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Người dùng mới</h3></div>
            <div className="card-body">
              {recentUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="navbar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>{u.full_name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <span className="badge badge-primary">{u.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Khóa học gần đây</h3></div>
            <div className="card-body">
              {recentCourses.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.instructor_name}</div>
                  </div>
                  <span className={`badge ${c.status === 'approved' ? 'badge-success' : c.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                    {c.status === 'approved' ? 'Đã duyệt' : c.status === 'pending' ? 'Chờ duyệt' : c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
