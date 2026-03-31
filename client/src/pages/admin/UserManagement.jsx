import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { FiShield, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const roleText = { student: 'Học viên', instructor: 'Giảng viên', admin: 'Admin' };
  const roleClass = { student: 'badge-info', instructor: 'badge-warning', admin: 'badge-danger' };

  const loadUsers = () => {
    adminAPI.getAllUsers()
      .then(data => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  // Lọc người dùng
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !searchTerm || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm);
      const matchRole = !filterRole || u.role === filterRole;
      const matchStatus = filterStatus === '' || 
        (filterStatus === '1' && u.is_active) || 
        (filterStatus === '0' && !u.is_active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

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

        {/* Bộ lọc & tìm kiếm */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              className="form-select"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="student">Học viên</option>
              <option value="instructor">Giảng viên</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="form-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Hiển thị số kết quả lọc */}
        {(searchTerm || filterRole || filterStatus) && (
          <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Tìm thấy <strong style={{ color: 'var(--accent-primary)' }}>{filteredUsers.length}</strong> người dùng</span>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearchTerm(''); setFilterRole(''); setFilterStatus(''); }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
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
                        <button className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-success'}`} onClick={() => handleToggleActive(u.id)} title={u.is_active ? 'Khóa tài khoản' : 'Mở tài khoản'}>
                          {u.is_active ? <><FiToggleRight /> Khóa</> : <><FiToggleLeft /> Mở</>}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
