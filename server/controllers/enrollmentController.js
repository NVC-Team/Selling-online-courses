const { db } = require('../config/db');

// Enroll in a course
exports.enroll = (req, res) => {
    try {
        const { course_id } = req.body;

        const course = db.prepare("SELECT * FROM courses WHERE id = ? AND status = 'approved'").get(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        const existing = db.prepare(
            'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?'
        ).get(req.user.id, course_id);

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
            }
            // Reactivate cancelled enrollment
            db.prepare(`UPDATE enrollments SET status = 'active', enrolled_at = datetime('now') WHERE id = ?`)
                .run(existing.id);
        } else {
            db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(req.user.id, course_id);
        }

        res.status(201).json({ message: 'Đăng ký khóa học thành công' });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get user's enrolled courses
exports.getMyEnrollments = (req, res) => {
    try {
        const enrollments = db.prepare(`
            SELECT e.*, c.title, c.thumbnail, c.category, c.level, c.total_lectures, c.total_duration,
                   u.full_name as instructor_name
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            JOIN users u ON c.instructor_id = u.id
            WHERE e.user_id = ? AND e.status = 'active'
            ORDER BY e.enrolled_at DESC
        `).all(req.user.id);

        res.json({ enrollments });
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cancel enrollment
exports.cancelEnrollment = (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ? AND user_id = ?').get(id, req.user.id);
        if (!enrollment) {
            return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
        }

        db.prepare(`UPDATE enrollments SET status = 'cancelled' WHERE id = ?`).run(id);
        res.json({ message: 'Hủy đăng ký thành công' });
    } catch (error) {
        console.error('Cancel enrollment error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get students for a course (instructor)
exports.getCourseStudents = (req, res) => {
    try {
        const { courseId } = req.params;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem danh sách học viên' });
        }

        const students = db.prepare(`
            SELECT e.*, u.full_name, u.email, u.phone, u.avatar
            FROM enrollments e
            JOIN users u ON e.user_id = u.id
            WHERE e.course_id = ? AND e.status = 'active'
            ORDER BY e.enrolled_at DESC
        `).all(courseId);

        res.json({ students });
    } catch (error) {
        console.error('Get course students error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Add student to course (instructor)
exports.addStudent = (req, res) => {
    try {
        const { courseId } = req.params;
        const { email } = req.body;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền' });
        }

        const student = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy học viên với email này' });
        }

        const existing = db.prepare(
            'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?'
        ).get(student.id, courseId);

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ message: 'Học viên đã đăng ký khóa học này' });
            }
            db.prepare(`UPDATE enrollments SET status = 'active' WHERE id = ?`).run(existing.id);
        } else {
            db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(student.id, courseId);
        }

        res.json({ message: 'Thêm học viên thành công' });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Remove student from course (instructor)
exports.removeStudent = (req, res) => {
    try {
        const { courseId, userId } = req.params;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền' });
        }

        db.prepare(`UPDATE enrollments SET status = 'cancelled' WHERE user_id = ? AND course_id = ?`)
            .run(userId, courseId);

        res.json({ message: 'Xóa học viên thành công' });
    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
