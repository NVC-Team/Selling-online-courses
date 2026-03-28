import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      formData.append('phone', form.phone);
      const data = await authAPI.updateProfile(formData);
      updateUser(data.user);
      setMessage('Cập nhật hồ sơ thành công');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleText = { student: 'Học viên', instructor: 'Giảng viên', admin: 'Quản trị viên' };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1 className="page-title">Hồ sơ cá nhân</h1>
        </div>

        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', paddingBottom: '24px' }}>
            <div className="navbar-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 16px' }}>
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{user?.full_name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.email}</p>
            <span className="badge badge-primary" style={{ marginTop: '8px' }}>{roleText[user?.role]}</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-body">
            {message && <div className="alert alert-success">✅ {message}</div>}
            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><FiUser style={{ marginRight: '6px' }} />Họ và tên</label>
                <input type="text" className="form-input" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label>
                <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                <span className="form-hint">Email không thể thay đổi</span>
              </div>
              <div className="form-group">
                <label className="form-label"><FiPhone style={{ marginRight: '6px' }} />Số điện thoại</label>
                <input type="tel" className="form-input" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
