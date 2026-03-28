import { useState } from 'react';
import { authAPI } from '../services/api';
import { FiLock, FiSave } from 'react-icons/fi';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (form.new_password !== form.confirm_password) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    if (form.new_password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.changePassword(form.current_password, form.new_password);
      setMessage(data.message);
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="page-header">
          <h1 className="page-title">Đổi mật khẩu</h1>
        </div>

        <div className="card">
          <div className="card-body">
            {message && <div className="alert alert-success">✅ {message}</div>}
            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Mật khẩu hiện tại</label>
                <input type="password" className="form-input" value={form.current_password}
                  onChange={e => setForm({ ...form, current_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Mật khẩu mới</label>
                <input type="password" className="form-input" placeholder="Tối thiểu 6 ký tự" value={form.new_password}
                  onChange={e => setForm({ ...form, new_password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Xác nhận mật khẩu mới</label>
                <input type="password" className="form-input" value={form.confirm_password}
                  onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave /> {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
