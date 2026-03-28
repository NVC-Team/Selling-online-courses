const { db } = require('../config/db');

// Update lecture progress
exports.updateProgress = (req, res) => {
    try {
        const { lecture_id, watch_time, is_completed } = req.body;

        const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(lecture_id);
        if (!lecture) {
            return res.status(404).json({ message: 'Không tìm thấy bài giảng' });
        }

        const existing = db.prepare(
            'SELECT * FROM lecture_progress WHERE user_id = ? AND lecture_id = ?'
        ).get(req.user.id, lecture_id);

        if (existing) {
            db.prepare(`
                UPDATE lecture_progress 
                SET watch_time = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END
                WHERE user_id = ? AND lecture_id = ?
            `).run(watch_time || existing.watch_time, is_completed ? 1 : 0, is_completed ? 1 : 0, req.user.id, lecture_id);
        } else {
            db.prepare(`
                INSERT INTO lecture_progress (user_id, lecture_id, watch_time, is_completed, completed_at)
                VALUES (?, ?, ?, ?, CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)
            `).run(req.user.id, lecture_id, watch_time || 0, is_completed ? 1 : 0, is_completed ? 1 : 0);
        }

        // Update enrollment progress
        const courseId = lecture.course_id;
        const totalLectures = db.prepare('SELECT COUNT(*) as count FROM lectures WHERE course_id = ?').get(courseId);
        const completedLectures = db.prepare(`
            SELECT COUNT(*) as count FROM lecture_progress lp
            JOIN lectures l ON lp.lecture_id = l.id
            WHERE l.course_id = ? AND lp.user_id = ? AND lp.is_completed = 1
        `).get(courseId, req.user.id);

        const progressPercent = totalLectures.count > 0
            ? Math.round((completedLectures.count / totalLectures.count) * 100)
            : 0;

        db.prepare('UPDATE enrollments SET progress_percent = ? WHERE user_id = ? AND course_id = ?')
            .run(progressPercent, req.user.id, courseId);

        // Mark enrollment as completed if 100%
        if (progressPercent >= 100) {
            db.prepare(`UPDATE enrollments SET status = 'completed' WHERE user_id = ? AND course_id = ?`)
                .run(req.user.id, courseId);
        }

        res.json({ message: 'Cập nhật tiến độ thành công', progress_percent: progressPercent });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get progress for a course
exports.getCourseProgress = (req, res) => {
    try {
        const { courseId } = req.params;

        const lectures = db.prepare(`
            SELECT l.id, l.title, l.order_index, l.duration,
                   lp.is_completed, lp.watch_time
            FROM lectures l
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = ?
            WHERE l.course_id = ?
            ORDER BY l.order_index
        `).all(req.user.id, courseId);

        const enrollment = db.prepare(
            'SELECT progress_percent FROM enrollments WHERE user_id = ? AND course_id = ?'
        ).get(req.user.id, courseId);

        res.json({
            lectures,
            progress_percent: enrollment ? enrollment.progress_percent : 0
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
