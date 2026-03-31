import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiDollarSign, FiTrendingUp, FiShoppingCart } from 'react-icons/fi';

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  useEffect(() => {
    adminAPI.getRevenue()
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  const { stats, monthlyRevenue, courseRevenue } = data;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Doanh thu</h1>
          <p className="page-subtitle">Thống kê doanh thu hệ thống</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}><FiDollarSign /></div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-card-label">Tổng doanh thu</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}><FiShoppingCart /></div>
            <div className="stat-card-value">{stats.totalEnrollments}</div>
            <div className="stat-card-label">Tổng đăng ký</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00' }}><FiTrendingUp /></div>
            <div className="stat-card-value">{stats.totalCourses}</div>
            <div className="stat-card-label">Khóa học hoạt động</div>
          </div>
        </div>

        <div className="admin-two-col">
          {/* Monthly Revenue */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Doanh thu theo tháng</h3></div>
            <div className="card-body">
              {monthlyRevenue.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</p>
              ) : (
                <div>
                  {monthlyRevenue.map(m => (
                    <div key={m.month} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.month}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.transactions} giao dịch</div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatPrice(m.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Course */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Doanh thu theo khóa học</h3></div>
            <div className="card-body">
              {courseRevenue.filter(c => c.revenue > 0).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</p>
              ) : (
                <div>
                  {courseRevenue.filter(c => c.revenue > 0).map((c, idx) => {
                    const maxRevenue = Math.max(...courseRevenue.map(x => x.revenue));
                    const barWidth = maxRevenue > 0 ? (c.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={c.course_id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>{c.title}</span>
                          <span style={{ color: 'var(--accent-primary)' }}>{formatPrice(c.revenue)}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${barWidth}%` }}></div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.sales} lượt mua</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
