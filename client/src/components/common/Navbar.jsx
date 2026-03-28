import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBookOpen, FiGrid, FiShield, FiLock } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          EduPlatform
        </Link>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/courses" className={isActive('/courses')} onClick={() => setMenuOpen(false)}>
            Khóa học
          </Link>
          
          {user && user.role === 'student' && (
            <Link to="/my-courses" className={isActive('/my-courses')} onClick={() => setMenuOpen(false)}>
              Khóa học của tôi
            </Link>
          )}
          
          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <Link to="/instructor" className={isActive('/instructor')} onClick={() => setMenuOpen(false)}>
              Giảng viên
            </Link>
          )}
          
          {user && user.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>
              Quản trị
            </Link>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="navbar-dropdown">
              <div 
                className="navbar-avatar" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={user.full_name}
              >
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
                    onClick={() => setDropdownOpen(false)} />
                  <div className="navbar-dropdown-menu">
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-default)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span className={`badge badge-primary`} style={{ marginTop: '4px', fontSize: '0.68rem' }}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                      </span>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                      <FiUser /> Hồ sơ
                    </Link>
                    {user.role === 'student' && (
                      <Link to="/my-courses" onClick={() => setDropdownOpen(false)}>
                        <FiBookOpen /> Khóa học của tôi
                      </Link>
                    )}
                    <Link to="/change-password" onClick={() => setDropdownOpen(false)}>
                      <FiLock /> Đổi mật khẩu
                    </Link>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <Link to="/instructor" onClick={() => setDropdownOpen(false)}>
                        <FiGrid /> Quản lý khóa học
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                        <FiShield /> Quản trị hệ thống
                      </Link>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button onClick={handleLogout}>
                      <FiLogOut /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
