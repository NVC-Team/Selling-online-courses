import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, paymentAPI, reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiClock, FiBookOpen, FiUsers, FiPlay, FiLock, FiShoppingCart, FiCheck, FiYoutube, FiStar, FiTrash2, FiEdit, FiSend } from 'react-icons/fi';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

function StarRating({ rating, onRate, size = '1.2rem', interactive = false }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fontSize: size,
            color: star <= rating ? '#f59e0b' : 'var(--text-muted)',
            transition: 'transform 0.15s, color 0.15s',
          }}
          onMouseEnter={e => interactive && (e.target.style.transform = 'scale(1.2)')}
          onMouseLeave={e => interactive && (e.target.style.transform = 'scale(1)')}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewStats({ stats }) {
  if (!stats || stats.total === 0) return null;
  const bars = [
    { label: '5', count: stats.star5 || 0 },
    { label: '4', count: stats.star4 || 0 },
    { label: '3', count: stats.star3 || 0 },
    { label: '2', count: stats.star2 || 0 },
    { label: '1', count: stats.star1 || 0 },
  ];

  return (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
      {/* Score */}
      <div style={{ textAlign: 'center', minWidth: '120px' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: '#f59e0b' }}>{stats.average || 0}</div>
        <StarRating rating={Math.round(stats.average || 0)} size="1rem" />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stats.total} đánh giá</div>
      </div>
      {/* Bars */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.82rem', width: '20px', textAlign: 'right', color: 'var(--text-muted)' }}>{b.label}★</span>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${stats.total ? (b.count / stats.total) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '24px' }}>{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [pendingPayment, setPendingPayment] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [editingReview, setEditingReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: '', text: '' });

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const levelText = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  useEffect(() => {
    courseAPI.getCourseById(id)
      .then(data => {
        setCourse(data.course);
        setLectures(data.lectures || []);
      })
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));

    // Load reviews
    loadReviews();
  }, [id]);

  const loadReviews = () => {
    reviewAPI.getCourseReviews(id)
      .then(data => {
        setReviews(data.reviews);
        setReviewStats(data.stats);
        // Check if current user has a review
        if (user) {
          const myReview = data.reviews.find(r => r.user_id === user.id);
          if (myReview) {
            setMyRating(myReview.rating);
            setMyComment(myReview.comment);
            setEditingReview(false);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user) {
      enrollmentAPI.getMyEnrollments()
        .then(data => {
          const enrollment = data.enrollments.find(e => e.course_id === parseInt(id));
          if (enrollment) {
            setEnrolled(true);
            setProgressPercent(enrollment.progress_percent || 0);
          }
        })
        .catch(() => {});

      paymentAPI.getMyPayments()
        .then(data => {
          const pending = data.payments.find(p => p.course_id === parseInt(id) && p.status === 'pending');
          if (pending) setPendingPayment(pending);
        })
        .catch(() => {});
    }
  }, [user, id]);

  const handleSubmitReview = async () => {
    if (myRating === 0) {
      setReviewMsg({ type: 'danger', text: 'Vui lòng chọn số sao' });
      return;
    }
    setReviewSubmitting(true);
    setReviewMsg({ type: '', text: '' });
    try {
      await reviewAPI.createReview(id, myRating, myComment);
      setReviewMsg({ type: 'success', text: '✅ Đã gửi đánh giá thành công!' });
      setEditingReview(false);
      loadReviews();
    } catch (err) {
      setReviewMsg({ type: 'danger', text: err.message });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      setMyRating(0);
      setMyComment('');
      loadReviews();
    } catch (err) {
      setReviewMsg({ type: 'danger', text: err.message });
    }
  };

  if (loading) return <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner"></div></div>;
  if (!course) return null;

  const isOwner = user && course.instructor_id === user.id;
  const isAdmin = user && user.role === 'admin';
  const introVideoId = getYouTubeId(course.intro_video_url);
  const hasMyReview = reviews.some(r => r.user_id === user?.id);
  const canReview = enrolled && !hasMyReview;

  // Thumbnail: prefer YouTube thumbnail from intro video
  const getThumbnailSrc = () => {
    if (introVideoId) return `https://img.youtube.com/vi/${introVideoId}/hqdefault.jpg`;
    if (course.thumbnail) return `http://localhost:5000${course.thumbnail}`;
    return null;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/courses">Khóa học</Link>
          <span>/</span>
          <span>{course.title}</span>
        </div>

        <div className="course-detail-grid">
          {/* Main Content */}
          <div>
            <span className={`badge level-${course.level}`} style={{ marginBottom: '12px' }}>{levelText[course.level]}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', lineHeight: 1.3 }}>{course.title}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="course-card-instructor">
                <div className="course-card-instructor-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                  {course.instructor_name?.charAt(0)}
                </div>
                <span>{course.instructor_name}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUsers /> {course.student_count} học viên
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiBookOpen /> {course.total_lectures} bài giảng
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiClock /> {course.total_duration} phút
              </span>
              {reviewStats && reviewStats.total > 0 && (
                <span style={{ color: '#f59e0b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  ★ {reviewStats.average} ({reviewStats.total} đánh giá)
                </span>
              )}
            </div>

            {/* Intro Video */}
            {introVideoId && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiYoutube style={{ color: '#FF0000' }} /> Video giới thiệu
                </h2>
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${introVideoId}?rel=0&modestbranding=1`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video giới thiệu"
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>Mô tả khóa học</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{course.description}</p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
                Nội dung khóa học ({lectures.length} bài giảng)
              </h2>
              <div className="lecture-list" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
                {lectures.map((lecture, idx) => (
                  <div key={lecture.id} className="lecture-item" style={{ cursor: 'default' }}>
                    <div className="lecture-number">{idx + 1}</div>
                    <div className="lecture-info">
                      <h4>{lecture.title}</h4>
                      <span>{lecture.duration} phút</span>
                    </div>
                    {lecture.is_free ? (
                      <span className="badge badge-success"><FiPlay /> Miễn phí</span>
                    ) : (
                      <FiLock style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ========== REVIEWS SECTION ========== */}
            <div id="reviews">
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiStar style={{ color: '#f59e0b' }} /> Đánh giá từ học viên
              </h2>

              {/* Stats */}
              <ReviewStats stats={reviewStats} />

              {/* Write Review Form - only for enrolled students */}
              {enrolled && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                    {hasMyReview ? (editingReview ? '✏️ Sửa đánh giá' : '✅ Bạn đã đánh giá khóa học này') : '📝 Viết đánh giá'}
                  </h3>

                  {reviewMsg.text && (
                    <div className={`alert alert-${reviewMsg.type}`} style={{ marginBottom: '16px' }}>{reviewMsg.text}</div>
                  )}

                  {(!hasMyReview || editingReview) ? (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          Đánh giá của bạn
                        </label>
                        <StarRating rating={myRating} onRate={setMyRating} size="1.8rem" interactive />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          Nhận xét (tùy chọn)
                        </label>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                          value={myComment}
                          onChange={e => setMyComment(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting || myRating === 0}
                        >
                          <FiSend /> {reviewSubmitting ? 'Đang gửi...' : (hasMyReview ? 'Cập nhật' : 'Gửi đánh giá')}
                        </button>
                        {editingReview && (
                          <button className="btn btn-secondary" onClick={() => setEditingReview(false)}>Hủy</button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingReview(true)}>
                        <FiEdit /> Sửa đánh giá
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <FiStar style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '12px' }} />
                  <p>Chưa có đánh giá nào. {enrolled && 'Hãy là người đầu tiên đánh giá!'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)', padding: '20px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary, #9333ea))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                          }}>
                            {review.user_name?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{review.user_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <StarRating rating={review.rating} size="0.85rem" />
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        {user && (review.user_id === user.id || user.role === 'admin') && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteReview(review.id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                      {review.comment && (
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.92rem' }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card">
              <div style={{ height: '200px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', overflow: 'hidden' }}>
                {getThumbnailSrc() ? (
                  <img src={getThumbnailSrc()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '📚'}
              </div>
              <div className="card-body">
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
                  <span className="course-card-price" style={{ fontSize: '2rem' }}>{formatPrice(course.price)}</span>
                </div>

                {enrolled ? (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tiến độ học tập</span>
                        <span style={{ fontWeight: 600, color: progressPercent >= 100 ? 'var(--success)' : 'var(--primary)' }}>{progressPercent}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                    <Link to={`/learn/${course.id}`} className="btn btn-success w-full btn-lg" style={{ marginBottom: '12px' }}>
                      <FiPlay /> {progressPercent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Link>
                  </>
                ) : isOwner || isAdmin ? (
                  <Link to={`/instructor/courses/${course.id}/lectures`} className="btn btn-primary w-full btn-lg" style={{ marginBottom: '12px' }}>
                    Quản lý bài giảng
                  </Link>
                ) : pendingPayment ? (
                  <>
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px', textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                        <FiClock style={{ color: 'var(--warning)', fontSize: '1.2rem' }} />
                        <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Đang chờ xác nhận</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Bạn đã thanh toán khóa học này. Giảng viên sẽ xác nhận để mở khóa.
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Mã GD: <code style={{ fontWeight: 700, color: 'var(--warning)' }}>{pendingPayment.transaction_id}</code>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={user ? `/payment/${course.id}` : '/login'} className="btn btn-primary w-full btn-lg" style={{ marginBottom: '12px' }}>
                    <FiShoppingCart /> {course.price > 0 ? 'Mua khóa học' : 'Đăng ký miễn phí'}
                  </Link>
                )}

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Cấp độ:</span><span>{levelText[course.level]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Số bài giảng:</span><span>{course.total_lectures}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <span>Thời lượng:</span><span>{course.total_duration} phút</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span>Học viên:</span><span>{course.student_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
