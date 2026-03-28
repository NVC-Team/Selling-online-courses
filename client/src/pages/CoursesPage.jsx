import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const levelText = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

  useEffect(() => {
    courseAPI.getCategories().then(data => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;

    courseAPI.getAll(params)
      .then(data => {
        setCourses(data.courses);
        setPagination(data.pagination);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [page, category, level]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    const params = { page: 1, limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;

    courseAPI.getAll(params)
      .then(data => {
        setCourses(data.courses);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Khóa học</h1>
          <p className="page-subtitle">Khám phá các khóa học chất lượng để nâng cao kỹ năng</p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input type="text" className="form-input" placeholder="Tìm kiếm khóa học..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ minWidth: '150px' }}>
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="form-select" value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} style={{ minWidth: '130px' }}>
                <option value="">Tất cả cấp độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
              <button type="submit" className="btn btn-primary">
                <FiSearch /> Tìm
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <h3>Không tìm thấy khóa học</h3>
            <p>Thử thay đổi bộ lọc tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="course-grid">
              {courses.map(course => (
                <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none' }}>
                  <div className="course-card">
                    <div className="course-card-thumbnail">
                      {course.thumbnail ? (
                        <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>📚</span>
                      )}
                    </div>
                    <div className="course-card-body">
                      <span className="course-card-category">{course.category || 'Chung'}</span>
                      <h3 className="course-card-title">{course.title}</h3>
                      <p className="course-card-desc">{course.description}</p>
                      <div className="course-card-meta">
                        <span>📖 {course.total_lectures} bài</span>
                        <span>⏱️ {course.total_duration}p</span>
                        <span className={`badge level-${course.level}`}>{levelText[course.level]}</span>
                      </div>
                      <div className="course-card-footer">
                        <span className="course-card-price">{formatPrice(course.price)}</span>
                        <div className="course-card-instructor">
                          <div className="course-card-instructor-avatar">{course.instructor_name?.charAt(0)}</div>
                          {course.instructor_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
