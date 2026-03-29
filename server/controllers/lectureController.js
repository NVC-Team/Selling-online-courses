const { db } = require('../config/db');

// Get lectures for a course
exports.getLectures = (req, res) => {
    try {
        const { courseId } = req.params;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Check if user is enrolled or is the instructor
        let showFull = false;
        if (req.user) {
            const enrollment = db.prepare(
                "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'active'"
            ).get(req.user.id, courseId);
            showFull = !!enrollment || course.instructor_id === req.user.id || req.user.role === 'admin';
        }

        let lectures;
        if (showFull) {
            lectures = db.prepare(
                'SELECT * FROM lectures WHERE course_id = ? ORDER BY order_index'
            ).all(courseId);
        } else {
            lectures = db.prepare(
                'SELECT id, title, description, duration, order_index, is_free FROM lectures WHERE course_id = ? ORDER BY order_index'
            ).all(courseId);
        }

        res.json({ lectures, hasAccess: showFull });
    } catch (error) {
        console.error('Get lectures error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get single lecture (with video)
exports.getLectureById = (req, res) => {
    try {
        const { id } = req.params;

        const lecture = db.prepare(`
            SELECT l.*, c.instructor_id, c.title as course_title
            FROM lectures l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        `).get(id);

        if (!lecture) {
            return res.status(404).json({ message: 'Không tìm thấy bài giảng' });
        }

        // Check access: free lecture, enrolled, instructor, or admin
        if (!lecture.is_free) {
            if (!req.user) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }
            const enrollment = db.prepare(
                "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'active'"
            ).get(req.user.id, lecture.course_id);

            if (!enrollment && lecture.instructor_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Bạn cần đăng ký khóa học để xem bài giảng này' });
            }
        }

        // Sequential unlock check: ensure previous lecture is completed
        if (req.user && lecture.instructor_id !== req.user.id && req.user.role !== 'admin') {
            const previousLecture = db.prepare(
                'SELECT id FROM lectures WHERE course_id = ? AND order_index < ? ORDER BY order_index DESC LIMIT 1'
            ).get(lecture.course_id, lecture.order_index);

            if (previousLecture) {
                const prevProgress = db.prepare(
                    'SELECT is_completed FROM lecture_progress WHERE user_id = ? AND lecture_id = ?'
                ).get(req.user.id, previousLecture.id);

                if (!prevProgress || !prevProgress.is_completed) {
                    return res.status(403).json({ message: 'Bạn cần hoàn thành bài giảng trước đó để mở khóa bài này' });
                }
            }
        }

        // Get progress if user is logged in
        let progress = null;
        if (req.user) {
            progress = db.prepare(
                'SELECT * FROM lecture_progress WHERE user_id = ? AND lecture_id = ?'
            ).get(req.user.id, id);
        }

        res.json({ lecture, progress });
    } catch (error) {
        console.error('Get lecture error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Add lecture to course (instructor)
exports.createLecture = (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, duration, is_free, youtube_url } = req.body;
        const video_url = youtube_url || '';

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền thêm bài giảng' });
        }

        // Get next order_index
        const lastLecture = db.prepare(
            'SELECT MAX(order_index) as maxOrder FROM lectures WHERE course_id = ?'
        ).get(courseId);
        const order_index = (lastLecture.maxOrder || 0) + 1;

        const result = db.prepare(`
            INSERT INTO lectures (course_id, title, description, video_url, duration, order_index, is_free)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(courseId, title, description || '', video_url, duration || 0, order_index, is_free ? 1 : 0);

        // Update course totals
        const totals = db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration FROM lectures WHERE course_id = ?'
        ).get(courseId);
        db.prepare('UPDATE courses SET total_lectures = ?, total_duration = ? WHERE id = ?')
            .run(totals.count, totals.totalDuration, courseId);

        const lecture = db.prepare('SELECT * FROM lectures WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ message: 'Thêm bài giảng thành công', lecture });
    } catch (error) {
        console.error('Create lecture error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update lecture
exports.updateLecture = (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, duration, order_index, is_free, youtube_url } = req.body;

        const lecture = db.prepare(`
            SELECT l.*, c.instructor_id FROM lectures l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        `).get(id);

        if (!lecture) {
            return res.status(404).json({ message: 'Không tìm thấy bài giảng' });
        }

        if (lecture.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền sửa bài giảng' });
        }

        let query = 'UPDATE lectures SET course_id = course_id';
        const params = [];

        if (title) { query += ', title = ?'; params.push(title); }
        if (description !== undefined) { query += ', description = ?'; params.push(description); }
        if (duration !== undefined) { query += ', duration = ?'; params.push(duration); }
        if (order_index !== undefined) { query += ', order_index = ?'; params.push(order_index); }
        if (is_free !== undefined) { query += ', is_free = ?'; params.push(is_free ? 1 : 0); }
        if (youtube_url !== undefined) { query += ', video_url = ?'; params.push(youtube_url); }

        query += ' WHERE id = ?';
        params.push(id);

        db.prepare(query).run(...params);

        const updated = db.prepare('SELECT * FROM lectures WHERE id = ?').get(id);
        res.json({ message: 'Cập nhật bài giảng thành công', lecture: updated });
    } catch (error) {
        console.error('Update lecture error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete lecture
exports.deleteLecture = (req, res) => {
    try {
        const { id } = req.params;

        const lecture = db.prepare(`
            SELECT l.*, c.instructor_id FROM lectures l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = ?
        `).get(id);

        if (!lecture) {
            return res.status(404).json({ message: 'Không tìm thấy bài giảng' });
        }

        if (lecture.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài giảng' });
        }

        const courseId = lecture.course_id;
        db.prepare('DELETE FROM lectures WHERE id = ?').run(id);

        // Update course totals
        const totals = db.prepare(
            'SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as totalDuration FROM lectures WHERE course_id = ?'
        ).get(courseId);
        db.prepare('UPDATE courses SET total_lectures = ?, total_duration = ? WHERE id = ?')
            .run(totals.count, totals.totalDuration, courseId);

        res.json({ message: 'Xóa bài giảng thành công' });
    } catch (error) {
        console.error('Delete lecture error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
