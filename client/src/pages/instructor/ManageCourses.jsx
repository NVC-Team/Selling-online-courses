import { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', level: 'beginner' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

  const loadCourses = () => {
    courseAPI.getInstructorCourses()
      .then(data => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ title: '', description: '', price: '', category: '', level: 'beginner' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingCourse(c);
    setForm({ title: c.title, description: c.description, price: c.price, category: c.category, level: c.level });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      
      if (editingCourse) {
        await courseAPI.update(editingCourse.id, formData);
        setMsg({ type: 'success', text: 'Cập nhật khóa học thành công' });
      } else {
        await courseAPI.create(formData);
        setMsg({ type: 'success', text: 'Tạo khóa học thành công' });
      }
      setShowModal(false);
      loadCourses();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
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

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="page-title">Quản lý khóa học</h1>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Tạo khóa học mới</button>
        </div>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Khóa học</th><th>Danh mục</th><th>Giá</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight: 600 }}>{c.title}</div></td>
                    <td>{c.category}</td>
                    <td>{formatPrice(c.price)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}><FiEdit /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
                      </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <input type="text" className="form-input" placeholder="VD: Lập trình Web" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">{editingCourse ? 'Cập nhật' : 'Tạo mới'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
