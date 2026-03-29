import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lectureAPI, progressAPI } from '../services/api';
import { FiCheck, FiPlay, FiChevronLeft, FiLock, FiAward } from 'react-icons/fi';

// Extract YouTube video ID from various URL formats
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function LearningPage() {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [totalLectures, setTotalLectures] = useState(0);
  const [completedLectures, setCompletedLectures] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    return Promise.all([
      lectureAPI.getByCourse(courseId),
      progressAPI.getCourseProgress(courseId)
    ]).then(([lectureData, progData]) => {
      setLectures(lectureData.lectures);
      setProgressData(progData.lectures);
      setProgressPercent(progData.progress_percent);
      setTotalLectures(progData.total_lectures);
      setCompletedLectures(progData.completed_lectures);
      return { lectureData, progData };
    });
  };

  useEffect(() => {
    loadData().then(({ lectureData, progData }) => {
      if (lectureData.lectures.length > 0) {
        // Find first unlocked, uncompleted lecture or fallback to first
        const firstUnlocked = progData.lectures.find(l => !l.is_locked && !l.is_completed);
        const targetId = firstUnlocked ? firstUnlocked.id : lectureData.lectures[0].id;
        const target = lectureData.lectures.find(l => l.id === targetId) || lectureData.lectures[0];
        setCurrentLecture(target);
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const isLocked = (lectureId) => {
    const p = progressData.find(p => p.id === lectureId);
    return p ? p.is_locked : false;
  };

  const isCompleted = (lectureId) => {
    const p = progressData.find(p => p.id === lectureId);
    return p && p.is_completed;
  };

  const handleSelectLecture = async (lecture) => {
    if (isLocked(lecture.id)) return;
    setCurrentLecture(lecture);
    try {
      const data = await lectureAPI.getById(lecture.id);
      setCurrentLecture(data.lecture);
    } catch { }
  };

  const handleComplete = async () => {
    if (!currentLecture) return;
    try {
      const data = await progressAPI.update(currentLecture.id, currentLecture.duration * 60, true);
      setProgressPercent(data.progress_percent);

      // Reload progress to update lock states
      const progData = await progressAPI.getCourseProgress(courseId);
      setProgressData(progData.lectures);
      setTotalLectures(progData.total_lectures);
      setCompletedLectures(progData.completed_lectures);

      // Auto-advance to next lecture
      const currentIdx = lectures.findIndex(l => l.id === currentLecture.id);
      if (currentIdx < lectures.length - 1) {
        const nextLecture = lectures[currentIdx + 1];
        setCurrentLecture(nextLecture);
        try {
          const nextData = await lectureAPI.getById(nextLecture.id);
          setCurrentLecture(nextData.lecture);
        } catch { }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderVideo = () => {
    if (!currentLecture?.video_url) {
      return (
        <div className="video-placeholder">
          <FiPlay style={{ fontSize: '4rem', opacity: 0.3 }} />
          <p>Video chưa có sẵn</p>
          <p style={{ fontSize: '0.85rem' }}>Giảng viên chưa thêm video cho bài giảng này</p>
        </div>
      );
    }

    const youtubeId = getYouTubeId(currentLecture.video_url);

    if (youtubeId) {
      return (
        <iframe
          key={currentLecture.video_url}
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={currentLecture.title}
        />
      );
    }

    return (
      <video controls autoPlay key={currentLecture.video_url} style={{ width: '100%', height: '100%' }}>
        <source src={`http://localhost:5000${currentLecture.video_url}`} />
      </video>
    );
  };

  if (loading) return <div className="loading-spinner" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>;

  return (
    <div className="learning-layout">
      {/* Video Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Enhanced Progress Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <Link to={`/courses/${courseId}`} className="btn btn-secondary btn-sm">
              <FiChevronLeft /> Quay lại
            </Link>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{currentLecture?.title || 'Chọn bài giảng'}</h2>
            </div>
          </div>

          {/* Big Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="progress-bar" style={{ flex: 1, height: '10px' }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, transition: 'width 0.5s ease' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              {progressPercent >= 100 && <FiAward style={{ color: 'var(--success)', fontSize: '1.2rem' }} />}
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: progressPercent >= 100 ? 'var(--success)' : 'var(--text-secondary)' }}>
                {completedLectures}/{totalLectures} bài • {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="video-player-container">
            {renderVideo()}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{currentLecture?.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentLecture?.description}</p>
              </div>
              {currentLecture && !isCompleted(currentLecture.id) && (
                <button className="btn btn-success" onClick={handleComplete}>
                  <FiCheck /> Đánh dấu hoàn thành
                </button>
              )}
              {currentLecture && isCompleted(currentLecture.id) && (
                <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <FiCheck /> Đã hoàn thành
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Sidebar */}
      <div className="learning-sidebar">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Nội dung bài giảng</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {completedLectures}/{totalLectures} bài đã hoàn thành
          </span>
          <div className="progress-bar" style={{ marginTop: '8px', height: '6px' }}>
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
        <div className="lecture-list">
          {lectures.map((lecture, idx) => {
            const locked = isLocked(lecture.id);
            const completed = isCompleted(lecture.id);
            return (
              <div
                key={lecture.id}
                className={`lecture-item ${currentLecture?.id === lecture.id ? 'active' : ''} ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}`}
                onClick={() => handleSelectLecture(lecture)}
                style={{
                  cursor: locked ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  position: 'relative'
                }}
                title={locked ? 'Hoàn thành bài trước để mở khóa' : ''}
              >
                <div className="lecture-number" style={{
                  background: completed ? 'var(--success)' : locked ? 'var(--bg-elevated)' : undefined,
                  color: completed ? '#fff' : locked ? 'var(--text-muted)' : undefined
                }}>
                  {completed ? <FiCheck /> : locked ? <FiLock style={{ fontSize: '0.75rem' }} /> : idx + 1}
                </div>
                <div className="lecture-info">
                  <h4 style={{ color: locked ? 'var(--text-muted)' : undefined }}>{lecture.title}</h4>
                  <span>{lecture.duration} phút</span>
                </div>
                {locked && (
                  <FiLock style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
