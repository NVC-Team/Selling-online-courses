import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiCheck, FiX } from 'react-icons/fi';

export default function ApproveCourses() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const statusText = { draft: 'Nháp', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
  const statusClass = { draft: 'badge-info', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };

  const loadCourses = () => {
    setLoading(true);
    adminAPI.getAllCourses(filter || undefined)
      .then(data => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateCourseStatus(id, status);
      setMsg({ type: 'success', text: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} khóa học` });
      loadCourses();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Duyệt khóa học</h1>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        <div className="tabs">
          {['pending', 'approved', 'rejected', ''].map(s => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === '' ? 'Tất cả' : statusText[s]} 
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <h3>Không có khóa học nào</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Khóa học</th><th>Giảng viên</th><th>Trạng thái</th><th>Học viên</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.category}</div>
                    </td>
                    <td>{c.instructor_name}</td>
                    <td><span className={`badge ${statusClass[c.status]}`}>{statusText[c.status]}</span></td>
                    <td>{c.student_count}</td>
                    <td>
                      {c.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(c.id, 'approved')}>
                            <FiCheck /> Duyệt
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(c.id, 'rejected')}>
                            <FiX /> Từ chối
                          </button>
                        </div>
                      )}
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
