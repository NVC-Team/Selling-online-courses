import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiMail, FiSend, FiLock, FiKey } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: reset
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email);
      setMessage(data.message);
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      const data = await authAPI.resetPassword(resetToken, newPassword);
      setMessage(data.message + ' Bạn có thể đăng nhập ngay.');
      setStep(3);
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
          <p>{step === 1 ? 'Nhập email để lấy lại mật khẩu' : step === 2 ? 'Đặt mật khẩu mới' : 'Hoàn tất!'}</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {message && <div className="alert alert-success">✅ {message}</div>}

        {step === 1 && (
          <form onSubmit={handleForgot}>
            <div className="form-group">
              <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label>
              <input type="email" className="form-input" placeholder="Nhập email đã đăng ký" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              <FiSend /> {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label"><FiKey style={{ marginRight: '6px' }} />Mã xác nhận</label>
              <input type="text" className="form-input" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Mật khẩu mới</label>
              <input type="password" className="form-input" placeholder="Tối thiểu 6 ký tự" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              <FiLock /> {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {step === 3 && (
          <Link to="/login" className="btn btn-primary w-full btn-lg">Đăng nhập ngay</Link>
        )}

        <div className="auth-footer">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
