import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, paymentAPI } from '../services/api';
import { FiClock, FiShield, FiCheckCircle } from 'react-icons/fi';

// Demo bank info - replace with real info
const BANK_INFO = {
  bankId: 'MB',
  accountNo: '0123456789',
  accountName: 'NGUYEN VAN A',
  template: 'compact2'
};

export default function PaymentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  useEffect(() => {
    courseAPI.getCourseById(courseId)
      .then(data => setCourse(data.course))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleCreatePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const data = await paymentAPI.create(parseInt(courseId), 'bank_transfer');
      setPayment(data.payment);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Generate VietQR URL
  const getQRUrl = () => {
    if (!course || !payment) return '';
    const amount = course.price;
    const content = `${payment.transaction_id} ${course.title}`.substring(0, 50);
    return `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  // QR Code + Waiting state
  if (payment) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '40px' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'var(--warning-bg)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 20px', fontSize: '1.5rem', color: 'var(--warning)' 
          }}>
            <FiClock />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Quét mã QR để thanh toán</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Chuyển khoản đúng số tiền và nội dung bên dưới
          </p>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-body" style={{ padding: '24px' }}>
              {/* QR Code */}
              <div style={{ 
                background: 'white', borderRadius: 'var(--radius-lg)', 
                padding: '16px', display: 'inline-block', marginBottom: '20px' 
              }}>
                <img 
                  src={getQRUrl()} 
                  alt="QR Code thanh toán"
                  style={{ width: '280px', height: '280px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: 'none', padding: '40px', color: '#666', fontSize: '0.9rem' }}>
                  Không tải được mã QR. Vui lòng chuyển khoản thủ công.
                </div>
              </div>

              {/* Bank details */}
              <div style={{ textAlign: 'left', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ngân hàng</span>
                    <span style={{ fontWeight: 700 }}>{BANK_INFO.bankId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Số tài khoản</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{BANK_INFO.accountNo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chủ tài khoản</span>
                    <span style={{ fontWeight: 700 }}>{BANK_INFO.accountName}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Số tiền</span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary-hover)' }}>{formatPrice(course?.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nội dung CK</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--warning)' }}>{payment.transaction_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status notice */}
          <div className="alert alert-warning" style={{ textAlign: 'left' }}>
            <FiClock /> Sau khi chuyển khoản, vui lòng chờ giảng viên xác nhận. Bạn sẽ được mở khóa học ngay khi giảng viên xác nhận thanh toán.
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <Link to={`/courses/${courseId}`} className="btn btn-secondary">← Quay lại khóa học</Link>
            <Link to="/courses" className="btn btn-outline">Xem khóa học khác</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="breadcrumb">
          <Link to={`/courses/${courseId}`}>← Quay lại khóa học</Link>
        </div>

        <h1 className="page-title" style={{ marginBottom: '32px' }}>Thanh toán</h1>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <div className="card">
          <div className="card-body">
            {/* Course info */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ width: '80px', height: '60px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                {course?.thumbnail ? (
                  <img src={`http://localhost:5000${course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                ) : '📚'}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{course?.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course?.instructor_name} • {course?.total_lectures} bài giảng</p>
              </div>
            </div>

            {/* Price summary */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Giá khóa học</span>
                <span>{formatPrice(course?.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-default)', fontWeight: 800, fontSize: '1.2rem' }}>
                <span>Tổng thanh toán</span>
                <span className="course-card-price">{formatPrice(course?.price)}</span>
              </div>
            </div>

            {/* Payment method info */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.3rem' }}>🏦</span>
                <span style={{ fontWeight: 700 }}>Chuyển khoản ngân hàng</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Sau khi bấm "Thanh toán", hệ thống sẽ hiện mã QR để bạn quét và chuyển khoản. 
                Giảng viên sẽ xác nhận và mở khóa học cho bạn.
              </p>
            </div>

            <button 
              className="btn btn-primary w-full btn-lg" 
              onClick={handleCreatePayment} 
              disabled={processing}
            >
              <FiCheckCircle /> {processing ? 'Đang xử lý...' : `Thanh toán ${formatPrice(course?.price)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FiShield /> Thanh toán an toàn & bảo mật
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
