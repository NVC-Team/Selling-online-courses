import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import { FiCheck, FiX, FiChevronLeft, FiClock, FiDollarSign } from 'react-icons/fi';

export default function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('pending');

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '';

  const statusText = { pending: 'Chờ xác nhận', completed: 'Đã xác nhận', failed: 'Từ chối', refunded: 'Hoàn tiền' };
  const statusClass = { pending: 'badge-warning', completed: 'badge-success', failed: 'badge-danger', refunded: 'badge-info' };

  const loadPayments = () => {
    setLoading(true);
    paymentAPI.getInstructorPayments()
      .then(data => setPayments(data.payments))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPayments(); }, []);

  const handleConfirm = async (id) => {
    if (!confirm('Xác nhận thanh toán này? Học viên sẽ được mở khóa học.')) return;
    try {
      await paymentAPI.confirmPayment(id);
      setMsg({ type: 'success', text: '✅ Đã xác nhận thanh toán. Học viên đã được mở khóa học.' });
      loadPayments();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Từ chối giao dịch này?')) return;
    try {
      await paymentAPI.rejectPayment(id);
      setMsg({ type: 'success', text: 'Đã từ chối giao dịch.' });
      loadPayments();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const filtered = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/instructor"><FiChevronLeft /> Quay lại</Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">Xác nhận thanh toán</h1>
          <p className="page-subtitle">
            Xác nhận thanh toán để mở khóa học cho học viên 
            {pendingCount > 0 && <span className="badge badge-warning" style={{ marginLeft: '10px' }}>{pendingCount} chờ xác nhận</span>}
          </p>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="tabs">
          {[
            { key: 'pending', label: `Chờ xác nhận (${payments.filter(p => p.status === 'pending').length})` },
            { key: 'completed', label: 'Đã xác nhận' },
            { key: 'failed', label: 'Từ chối' },
            { key: 'all', label: 'Tất cả' },
          ].map(t => (
            <button key={t.key} className={`tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FiDollarSign style={{ fontSize: '4rem', opacity: 0.3 }} />
            <h3>Không có giao dịch nào</h3>
            <p>{filter === 'pending' ? 'Chưa có học viên nào đang chờ xác nhận' : 'Không có giao dịch'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Số tiền</th>
                  <th>Mã GD</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.student_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.student_email}</div>
                      {p.student_phone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📱 {p.student_phone}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.course_title}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary-hover)' }}>{formatPrice(p.amount)}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                        {p.transaction_id}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {formatDate(p.paid_at)}
                    </td>
                    <td>
                      <span className={`badge ${statusClass[p.status]}`}>
                        {p.status === 'pending' && <FiClock style={{ marginRight: '4px' }} />}
                        {statusText[p.status]}
                      </span>
                    </td>
                    <td>
                      {p.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleConfirm(p.id)}>
                            <FiCheck /> Xác nhận
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(p.id)}>
                            <FiX /> Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
