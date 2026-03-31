import { useState, useEffect } from 'react';
import { courseAPI, lectureAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiEdit, FiTrash2, FiX, FiYoutube, FiChevronRight, FiEye, FiUser, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ManageCourses() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('mine'); // 'mine' | 'all'
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', level: 'beginner', intro_video_url: '', duration_days: '' });
  const [lectures, setLectures] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  const loadCourses = () => {
    Promise.all([
      courseAPI.getInstructorCourses(),
      courseAPI.getAll({ limit: 100 })
    ]).then(([myData, allData]) => {
      setMyCourses(myData.courses);
      setAllCourses(allData.courses);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const isMyCoourse = (course) => course.instructor_id === user?.id;

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ title: '', description: '', price: '', category: '', level: 'beginner', intro_video_url: '', duration_days: '' });
    setLectures([]);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingCourse(c);
    setForm({ title: c.title, description: c.description, price: c.price, category: c.category, level: c.level, intro_video_url: c.intro_video_url || '', duration_days: c.duration_days || '' });
    setLectures([]);
    setShowModal(true);
  };

  // Inline lecture management
  const addLecture = () => {
    setLectures([...lectures, { title: '', youtube_url: '', duration: '', is_free: false }]);
  };

  const updateLecture = (index, field, value) => {
    const updated = [...lectures];
    updated[index] = { ...updated[index], [field]: value };
    setLectures(updated);
  };

  const removeLecture = (index) => {
    setLectures(lectures.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('level', form.level);
      formData.append('intro_video_url', form.intro_video_url);
      formData.append('duration_days', form.duration_days || '0');

      if (editingCourse) {
        await courseAPI.update(editingCourse.id, formData);
        setMsg({ type: 'success', text: 'Cập nhật khóa học thành công' });
      } else {
        const result = await courseAPI.create(formData);
        const courseId = result.course.id;

        for (const lec of lectures) {
          if (lec.title.trim()) {
            await lectureAPI.create(courseId, {
              title: lec.title,
              youtube_url: lec.youtube_url,
              duration: parseInt(lec.duration) || 0,
              is_free: lec.is_free
            });
          }
        }
        setMsg({ type: 'success', text: `Tạo khóa học thành công${lectures.length > 0 ? ` với ${lectures.filter(l => l.title.trim()).length} bài giảng` : ''}` });
      }
      setShowModal(false);
      loadCourses();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
      await courseAPI.delete(id);
      loadCourses();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    }
  };

  const displayedCourses = tab === 'mine' ? myCourses : allCourses;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="page-title">Quản lý khóa học</h1>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Tạo khóa học mới</button>
        </div>

        {/* Tabs: My Courses / All Courses */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setTab('mine')}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s', fontFamily: 'var(--font-family)',
              background: tab === 'mine' ? 'var(--accent-primary)' : 'transparent',
              color: tab === 'mine' ? '#0a0a0a' : 'var(--text-secondary)',
            }}
          >
            <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Khóa học của tôi ({myCourses.length})
          </button>
          <button
            onClick={() => setTab('all')}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s', fontFamily: 'var(--font-family)',
              background: tab === 'all' ? 'var(--accent-primary)' : 'transparent',
              color: tab === 'all' ? '#0a0a0a' : 'var(--text-secondary)',
            }}
          >
            <FiEye style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Tất cả khóa học ({allCourses.length})
          </button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : displayedCourses.length === 0 ? (
          <div className="empty-state">
            <h3>{tab === 'mine' ? 'Bạn chưa có khóa học nào' : 'Chưa có khóa học nào'}</h3>
            {tab === 'mine' && <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Tạo khóa học mới</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  {tab === 'all' && <th>Giảng viên</th>}
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Thời hạn</th>
                  <th>Bài giảng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.map(c => {
                  const isMine = isMyCoourse(c);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.title}</div>
                        {c.intro_video_url && (
                          <span style={{ fontSize: '0.78rem', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <FiYoutube /> Có video giới thiệu
                          </span>
                        )}
                      </td>
                      {tab === 'all' && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gradient)',
                              color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                            }}>
                              {c.instructor_name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '0.85rem' }}>
                              {c.instructor_name}
                              {isMine && <span style={{ color: 'var(--accent-primary)', fontWeight: 600, marginLeft: '4px' }}>(Tôi)</span>}
                            </span>
                          </div>
                        </td>
                      )}
                      <td>{c.category}</td>
                      <td>{formatPrice(c.price)}</td>
                      <td>
                        {c.duration_days && c.duration_days > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                            <FiClock /> {c.duration_days} ngày
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vĩnh viễn</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/instructor/courses/${c.id}/lectures`}
                          style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem' }}
                        >
                          {c.total_lectures} bài <FiChevronRight />
                        </Link>
                      </td>
                      <td>
                        {isMine ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} title="Sửa"><FiEdit /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)} title="Xóa"><FiTrash2 /></button>
                          </div>
                        ) : (
                          <Link to={`/courses/${c.id}`} className="btn btn-secondary btn-sm" title="Xem chi tiết">
                            <FiEye /> Xem
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
              <div className="modal-header">
                <h2 className="modal-title">{editingCourse ? 'Sửa khóa học' : 'Tạo khóa học mới'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên khóa học *</label>
                  <input type="text" className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ)</label>
                    <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cấp độ</label>
                    <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                      <option value="beginner">Cơ bản</option>
                      <option value="intermediate">Trung cấp</option>
                      <option value="advanced">Nâng cao</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock style={{ color: 'var(--accent-primary)' }} /> Thời hạn (ngày)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.duration_days}
                      onChange={e => setForm({ ...form, duration_days: e.target.value })}
                      placeholder="0 = Vĩnh viễn"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <input type="text" className="form-input" placeholder="VD: Lập trình Web" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>

                {/* YouTube Intro Video */}
                <div className="form-group" style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiYoutube style={{ color: '#ff4444', fontSize: '1.1rem' }} /> Video giới thiệu (YouTube)
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.intro_video_url}
                    onChange={e => setForm({ ...form, intro_video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <span className="form-hint">Video trailer/giới thiệu khóa học sẽ hiển thị ở trang chi tiết</span>
                  {form.intro_video_url && getYouTubeId(form.intro_video_url) && (
                    <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9', maxWidth: '320px' }}>
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeId(form.intro_video_url)}/mqdefault.jpg`}
                        alt="Video preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                {/* Inline Lectures (only for new courses) */}
                {!editingCourse && (
                  <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                        📚 Bài giảng ({lectures.length})
                      </label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addLecture}>
                        <FiPlus /> Thêm bài
                      </button>
                    </div>
                    {lectures.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                        Chưa có bài giảng. Bạn có thể thêm ngay hoặc thêm sau trong phần quản lý bài giảng.
                      </p>
                    )}
                    {lectures.map((lec, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)', marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Bài {idx + 1}</span>
                          <button type="button" onClick={() => removeLecture(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                            <FiTrash2 />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <input type="text" className="form-input" placeholder="Tiêu đề bài giảng *" value={lec.title}
                            onChange={e => updateLecture(idx, 'title', e.target.value)} style={{ fontSize: '0.88rem' }} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                            <input type="url" className="form-input" placeholder="Link YouTube" value={lec.youtube_url}
                              onChange={e => updateLecture(idx, 'youtube_url', e.target.value)} style={{ fontSize: '0.88rem' }} />
                            <input type="number" className="form-input" placeholder="Phút" value={lec.duration}
                              onChange={e => updateLecture(idx, 'duration', e.target.value)} style={{ fontSize: '0.88rem' }} />
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={lec.is_free} onChange={e => updateLecture(idx, 'is_free', e.target.checked)} />
                            Miễn phí (xem trước)
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang xử lý...' : (editingCourse ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
