import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>📚 EduPlatform</h1>
          <p>Đăng nhập để tiếp tục học tập</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label>
            <input type="email" className="form-input" placeholder="Nhập email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Mật khẩu</label>
            <input type="password" className="form-input" placeholder="Nhập mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>Quên mật khẩu?</Link>
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            <FiLogIn /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>Tài khoản demo:</strong><br />
          Admin: admin@example.com / admin123<br />
          Giảng viên: instructor1@example.com / instructor123<br />
          Học viên: student1@example.com / student123
        </div>
      </div>
    </div>
  );
}
