import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiX, FiChevronLeft, FiMail } from 'react-icons/fi';

export default function ManageStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadStudents = () => {
    enrollmentAPI.getCourseStudents(courseId)
      .then(data => setStudents(data.students))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, [courseId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await enrollmentAPI.addStudent(courseId, email);
      setMsg({ type: 'success', text: 'Thêm học viên thành công' });
      setShowModal(false);
      setEmail('');
      loadStudents();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Xóa học viên này khỏi khóa học?')) return;
    try {
      await enrollmentAPI.removeStudent(courseId, userId);
      loadStudents();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/instructor"><FiChevronLeft /> Quay lại</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title">Quản lý học viên</h1>
            <p className="page-subtitle">{students.length} học viên đang tham gia</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Thêm học viên</button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có học viên nào</h3>
            <p>Thêm học viên bằng email</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Học viên</th><th>Email</th><th>SĐT</th><th>Tiến độ</th><th>Ngày tham gia</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="navbar-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {s.full_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                      </div>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '80px' }}>
                          <div className="progress-bar-fill" style={{ width: `${s.progress_percent || 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.82rem' }}>{s.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(s.enrolled_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemove(s.user_id)}>
                        <FiTrash2 /> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Thêm học viên</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="form-group">
                  <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email học viên</label>
                  <input type="email" className="form-input" placeholder="Nhập email" value={email} onChange={e => setEmail(e.target.value)} required />
                  <span className="form-hint">Học viên phải có tài khoản trên hệ thống</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">Thêm học viên</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
