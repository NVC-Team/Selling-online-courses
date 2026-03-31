import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, paymentAPI } from '../services/api';
import { FiPlay, FiBookOpen, FiClock, FiAlertTriangle } from 'react-icons/fi';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  useEffect(() => {
    Promise.all([
      enrollmentAPI.getMyEnrollments(),
      paymentAPI.getMyPayments()
    ]).then(([enrollData, paymentData]) => {
      setEnrollments(enrollData.enrollments);
      // Filter pending payments that don't have matching active enrollments
      const activeIds = enrollData.enrollments.map(e => e.course_id);
      const pending = paymentData.payments.filter(p => p.status === 'pending' && !activeIds.includes(p.course_id));
      setPendingPayments(pending);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const expiredEnrollments = enrollments.filter(e => e.status === 'expired');
  const hasContent = enrollments.length > 0 || pendingPayments.length > 0;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Khóa học của tôi</h1>
          <p className="page-subtitle">Các khóa học bạn đã đăng ký</p>
        </div>

        {!hasContent ? (
          <div className="empty-state">
            <FiBookOpen style={{ fontSize: '4rem', opacity: 0.3 }} />
            <h3>Chưa có khóa học nào</h3>
            <p>Hãy khám phá và đăng ký khóa học đầu tiên</p>
            <Link to="/courses" className="btn btn-primary">Khám phá khóa học</Link>
          </div>
        ) : (
          <>
            {/* Pending Payments Section */}
            {pendingPayments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiClock style={{ color: 'var(--warning)' }} />
                  Đang chờ xác nhận ({pendingPayments.length})
                </h2>
                <div className="course-grid">
                  {pendingPayments.map(p => (
                    <div key={p.id} className="course-card" style={{ position: 'relative' }}>
                      {/* Pending overlay badge */}
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px', zIndex: 2,
                        background: 'rgba(255, 171, 0, 0.9)', color: '#0a0a0a',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <FiClock /> Chờ duyệt
                      </div>
                      <div className="course-card-thumbnail" style={{ opacity: 0.7 }}>
                        {p.thumbnail ? (
                          <img src={`http://localhost:5000${p.thumbnail}`} alt={p.course_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <span>📚</span>}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{p.course_title}</h3>
                        <div style={{
                          background: 'rgba(255, 171, 0, 0.08)', border: '1px solid rgba(255, 171, 0, 0.2)',
                          borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mã giao dịch</span>
                            <code style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.82rem' }}>{p.transaction_id}</code>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Số tiền</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatPrice(p.amount)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Trạng thái</span>
                            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                              <FiClock style={{ marginRight: '2px' }} /> Chờ giảng viên xác nhận
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                          Giảng viên sẽ xác nhận thanh toán và mở khóa học cho bạn
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Enrollments Section */}
            {activeEnrollments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                {(pendingPayments.length > 0 || expiredEnrollments.length > 0) && (
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                    Đang học ({activeEnrollments.length})
                  </h2>
                )}
                <div className="course-grid">
                  {activeEnrollments.map(e => (
                    <div key={e.id} className="course-card">
                      <div className="course-card-thumbnail">
                        {e.thumbnail ? (
                          <img src={`http://localhost:5000${e.thumbnail}`} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <span>📚</span>}
                      </div>
                      <div className="course-card-body">
                        <span className="course-card-category">{e.category || 'Chung'}</span>
                        <h3 className="course-card-title">{e.title}</h3>
                        
                        {/* Hiển thị thời hạn còn lại */}
                        {e.days_remaining !== null && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                            background: e.days_remaining <= 7 ? 'rgba(255, 82, 82, 0.08)' : 'rgba(0, 255, 136, 0.06)',
                            border: `1px solid ${e.days_remaining <= 7 ? 'rgba(255, 82, 82, 0.2)' : 'rgba(0, 255, 136, 0.15)'}`,
                            marginBottom: '10px', fontSize: '0.8rem',
                            color: e.days_remaining <= 7 ? 'var(--danger)' : 'var(--accent-primary)'
                          }}>
                            <FiClock />
                            <span style={{ fontWeight: 600 }}>
                              {e.days_remaining <= 0 ? 'Sắp hết hạn' : `Còn ${e.days_remaining} ngày`}
                            </span>
                          </div>
                        )}

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{e.progress_percent >= 100 ? '🎉 Hoàn thành' : 'Tiến độ'}</span>
                            <span style={{ fontWeight: 700, color: e.progress_percent >= 100 ? 'var(--success)' : 'var(--accent-primary)' }}>{e.progress_percent}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: '8px' }}>
                            <div className="progress-bar-fill" style={{ width: `${e.progress_percent}%`, background: e.progress_percent >= 100 ? 'var(--success)' : undefined }}></div>
                          </div>
                        </div>
                        <div className="course-card-meta">
                          <span>📖 {e.total_lectures} bài</span>
                          <span>⏱️ {e.total_duration}p</span>
                        </div>
                        <div className="course-card-footer">
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.instructor_name}</span>
                          <Link to={`/learn/${e.course_id}`} className={`btn ${e.progress_percent >= 100 ? 'btn-success' : 'btn-primary'} btn-sm`}>
                            <FiPlay /> {e.progress_percent > 0 ? (e.progress_percent >= 100 ? 'Xem lại' : 'Học tiếp') : 'Bắt đầu'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired Enrollments Section */}
            {expiredEnrollments.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                  <FiAlertTriangle />
                  Đã hết hạn ({expiredEnrollments.length})
                </h2>
                <div className="course-grid">
                  {expiredEnrollments.map(e => (
                    <div key={e.id} className="course-card course-expired">
                      <div className="course-card-thumbnail" style={{ opacity: 0.5 }}>
                        {e.thumbnail ? (
                          <img src={`http://localhost:5000${e.thumbnail}`} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <span>📚</span>}
                      </div>
                      <div className="course-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="course-card-category">{e.category || 'Chung'}</span>
                          <span className="badge badge-expired" style={{ fontSize: '0.72rem' }}>
                            <FiAlertTriangle style={{ marginRight: '3px' }} /> Hết hạn
                          </span>
                        </div>
                        <h3 className="course-card-title" style={{ opacity: 0.7 }}>{e.title}</h3>
                        <div style={{
                          background: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255, 82, 82, 0.2)',
                          borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: '0.82rem', color: 'var(--danger)', margin: 0, fontWeight: 600 }}>
                            Khóa học đã hết thời hạn truy cập
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                            Liên hệ giảng viên để gia hạn
                          </p>
                        </div>
                        <div className="course-card-footer">
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{e.instructor_name}</span>
                          <Link to={`/courses/${e.course_id}`} className="btn btn-secondary btn-sm">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
