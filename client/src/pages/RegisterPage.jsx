import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from 'react-icons/fi';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await register(form);
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
          <p>Tạo tài khoản để bắt đầu học</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><FiUser style={{ marginRight: '6px' }} />Họ và tên</label>
            <input type="text" name="full_name" className="form-input" placeholder="Nhập họ tên" value={form.full_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label>
            <input type="email" name="email" className="form-input" placeholder="Nhập email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label"><FiPhone style={{ marginRight: '6px' }} />Số điện thoại</label>
            <input type="tel" name="phone" className="form-input" placeholder="Nhập số điện thoại" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Mật khẩu</label>
            <input type="password" name="password" className="form-input" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="student">Học viên</option>
              <option value="instructor">Giảng viên</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            <FiUserPlus /> {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
