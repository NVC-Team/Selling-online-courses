import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lectureAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiX, FiYoutube, FiChevronLeft, FiEye } from 'react-icons/fi';

export default function ManageLectures() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', duration: '', is_free: false, youtube_url: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const isOwner = course && user && (course.instructor_id === user.id || user.role === 'admin');

  const loadData = () => {
    Promise.all([
      courseAPI.getCourseById(courseId),
      lectureAPI.getByCourse(courseId)
    ]).then(([courseData, lectureData]) => {
      setCourse(courseData.course);
      setLectures(lectureData.lectures);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [courseId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', duration: '', is_free: false, youtube_url: '' });
    setShowModal(true);
  };

  const openEdit = (l) => {
    setEditing(l);
    setForm({
      title: l.title,
      description: l.description,
      duration: l.duration,
      is_free: !!l.is_free,
      youtube_url: l.video_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const data = {
        title: form.title,
        description: form.description,
        duration: parseInt(form.duration) || 0,
        is_free: form.is_free,
        youtube_url: form.youtube_url
      };

      if (editing) {
        await lectureAPI.update(editing.id, data);
        setMsg({ type: 'success', text: 'Cập nhật bài giảng thành công' });
      } else {
        await lectureAPI.create(courseId, data);
        setMsg({ type: 'success', text: 'Thêm bài giảng thành công' });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài giảng này?')) return;
    try {
      await lectureAPI.delete(id);
      setMsg({ type: 'success', text: 'Đã xóa bài giảng' });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/instructor/courses"><FiChevronLeft /> Quay lại</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              {isOwner ? 'Quản lý bài giảng' : 'Xem bài giảng'}
            </h1>
            {course && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Khóa học: <strong>{course.title}</strong>
                {!isOwner && course.instructor_name && (
                  <span> • Giảng viên: {course.instructor_name}</span>
                )}
              </p>
            )}
          </div>
          {isOwner && (
            <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Thêm bài giảng</button>
          )}
        </div>

        {!isOwner && !loading && (
          <div className="alert alert-info" style={{ marginBottom: '20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.88rem' }}>
            <FiEye style={{ marginRight: '6px' }} />
            Bạn đang xem bài giảng của giảng viên khác. Chỉ có thể xem, không thể chỉnh sửa.
          </div>
        )}

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : lectures.length === 0 ? (
          <div className="empty-state">
            <h3>Chưa có bài giảng nào</h3>
            <p>{isOwner ? 'Thêm bài giảng đầu tiên cho khóa học' : 'Khóa học này chưa có bài giảng nào'}</p>
            {isOwner && (
              <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Thêm bài giảng</button>
            )}
          </div>
        ) : (
          <div className="lecture-list" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
            {lectures.map((l, idx) => (
              <div key={l.id} className="lecture-item" style={{ cursor: 'default' }}>
                <div className="lecture-number">{idx + 1}</div>
                <div className="lecture-info" style={{ flex: 1 }}>
                  <h4>{l.title}</h4>
                  <span>{l.duration} phút {l.is_free ? '• Miễn phí' : ''}</span>
                </div>
                {l.video_url && getYouTubeId(l.video_url) && (
                  <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiYoutube /> YouTube
                  </span>
                )}
                {l.video_url && !getYouTubeId(l.video_url) && (
                  <span className="badge badge-success">Có video</span>
                )}
                {isOwner && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)} title="Sửa"><FiEdit /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)} title="Xóa"><FiTrash2 /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editing ? 'Sửa bài giảng' : 'Thêm bài giảng'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tiêu đề *</label>
                  <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời lượng (phút)</label>
                  <input type="number" className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} />
                    <span className="form-label" style={{ margin: 0 }}>Bài giảng miễn phí (xem trước)</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label"><FiYoutube style={{ marginRight: '6px', color: '#FF0000' }} />Link YouTube</label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.youtube_url}
                    onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <span className="form-hint">Dán link video từ YouTube (ví dụ: https://youtube.com/watch?v=abc123)</span>
                  {form.youtube_url && getYouTubeId(form.youtube_url) && (
                    <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9', maxWidth: '300px' }}>
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeId(form.youtube_url)}/mqdefault.jpg`}
                        alt="Video preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Thêm'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
