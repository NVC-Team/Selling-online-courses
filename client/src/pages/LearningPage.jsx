import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lectureAPI, progressAPI } from '../services/api';
import { FiCheck, FiPlay, FiChevronLeft } from 'react-icons/fi';

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
  const [progress, setProgress] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      lectureAPI.getByCourse(courseId),
      progressAPI.getCourseProgress(courseId)
    ]).then(([lectureData, progressData]) => {
      setLectures(lectureData.lectures);
      setProgress(progressData.lectures);
      setProgressPercent(progressData.progress_percent);
      if (lectureData.lectures.length > 0) {
        setCurrentLecture(lectureData.lectures[0]);
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSelectLecture = async (lecture) => {
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
      setProgress(prev => prev.map(p =>
        p.id === currentLecture.id ? { ...p, is_completed: 1 } : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const isCompleted = (lectureId) => {
    const p = progress.find(p => p.id === lectureId);
    return p && p.is_completed;
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

    // Fallback for uploaded videos (legacy support)
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
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to={`/courses/${courseId}`} className="btn btn-secondary btn-sm">
            <FiChevronLeft /> Quay lại
          </Link>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{currentLecture?.title || 'Chọn bài giảng'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
              <div className="progress-bar" style={{ width: '200px' }}>
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{progressPercent}% hoàn thành</span>
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
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{lectures.length} bài giảng</span>
        </div>
        <div className="lecture-list">
          {lectures.map((lecture, idx) => (
            <div
              key={lecture.id}
              className={`lecture-item ${currentLecture?.id === lecture.id ? 'active' : ''} ${isCompleted(lecture.id) ? 'completed' : ''}`}
              onClick={() => handleSelectLecture(lecture)}
            >
              <div className="lecture-number">
                {isCompleted(lecture.id) ? <FiCheck /> : idx + 1}
              </div>
              <div className="lecture-info">
                <h4>{lecture.title}</h4>
                <span>{lecture.duration} phút</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
