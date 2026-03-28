import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiShield, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const roleText = { student: 'Học viên', instructor: 'Giảng viên', admin: 'Admin' };
  const roleClass = { student: 'badge-info', instructor: 'badge-warning', admin: 'badge-danger' };

  const loadUsers = () => {
    adminAPI.getAllUsers()
      .then(data => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setMsg({ type: 'success', text: 'Cập nhật vai trò thành công' });
      loadUsers();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await adminAPI.toggleUserActive(userId);
      setMsg({ type: 'success', text: 'Cập nhật trạng thái thành công' });
      loadUsers();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Quản lý người dùng</h1>
          <p className="page-subtitle">Phân quyền và quản lý tài khoản ({users.length} người dùng)</p>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="navbar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {u.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <select className="form-select" value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{ padding: '6px 30px 6px 10px', fontSize: '0.82rem', minWidth: '120px' }}>
                        <option value="student">Học viên</option>
                        <option value="instructor">Giảng viên</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleToggleActive(u.id)}>
                        {u.is_active ? <><FiToggleRight /> Khóa</> : <><FiToggleLeft /> Mở</>}
                      </button>
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
