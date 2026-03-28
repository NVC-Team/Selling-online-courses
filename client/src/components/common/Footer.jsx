import { Link } from 'react-router-dom';
import { FiGithub, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <span className="footer-brand">📚 EduPlatform</span>
            <p>Nền tảng học trực tuyến hàng đầu Việt Nam. Khám phá hàng trăm khóa học chất lượng từ các giảng viên uy tín.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> TP. Hồ Chí Minh, Việt Nam</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> contact@eduplatform.vn</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone /> 0123 456 789</span>
            </div>
          </div>
          <div className="footer-column">
            <h4>Khám phá</h4>
            <Link to="/courses">Tất cả khóa học</Link>
            <Link to="/courses">Lập trình Web</Link>
            <Link to="/courses">Data Science</Link>
            <Link to="/courses">Mobile Dev</Link>
            <Link to="/courses">UI/UX Design</Link>
          </div>
          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <Link to="/">Trung tâm trợ giúp</Link>
            <Link to="/">Điều khoản sử dụng</Link>
            <Link to="/">Chính sách bảo mật</Link>
            <Link to="/">Chính sách hoàn tiền</Link>
          </div>
          <div className="footer-column">
            <h4>Giảng viên</h4>
            <Link to="/register">Đăng ký giảng dạy</Link>
            <Link to="/">Hướng dẫn tạo khóa học</Link>
            <Link to="/">Quy tắc cộng đồng</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copyright">© 2026 EduPlatform. All rights reserved.</span>
          <div className="footer-social">
            <a href="#" title="GitHub"><FiGithub /></a>
            <a href="#" title="Email"><FiMail /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
