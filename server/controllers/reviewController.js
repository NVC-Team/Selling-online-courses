const { db } = require('../config/db');

// Get reviews for a course (public)
exports.getCourseReviews = (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = db.prepare(`
            SELECT r.*, u.full_name as user_name, u.avatar as user_avatar
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = ?
            ORDER BY r.created_at DESC
        `).all(courseId);

        // Calculate stats
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total,
                ROUND(AVG(rating), 1) as average,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star1
            FROM reviews WHERE course_id = ?
        `).get(courseId);

        res.json({ reviews, stats });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Create/update review (enrolled students only, must have completed the course or at least started)
exports.createReview = (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
        }

        // Check enrollment
        const enrollment = db.prepare(
            "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'active'"
        ).get(req.user.id, courseId);

        if (!enrollment) {
            return res.status(403).json({ message: 'Bạn cần đăng ký khóa học để đánh giá' });
        }

        // Check existing review
        const existing = db.prepare(
            'SELECT id FROM reviews WHERE user_id = ? AND course_id = ?'
        ).get(req.user.id, courseId);

        if (existing) {
            // Update
            db.prepare(
                "UPDATE reviews SET rating = ?, comment = ?, updated_at = datetime('now') WHERE id = ?"
            ).run(rating, comment || '', existing.id);

            const review = db.prepare(`
                SELECT r.*, u.full_name as user_name, u.avatar as user_avatar
                FROM reviews r JOIN users u ON r.user_id = u.id
                WHERE r.id = ?
            `).get(existing.id);

            return res.json({ message: 'Đã cập nhật đánh giá', review });
        }

        // Create new
        const result = db.prepare(
            'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)'
        ).run(req.user.id, courseId, rating, comment || '');

        const review = db.prepare(`
            SELECT r.*, u.full_name as user_name, u.avatar as user_avatar
            FROM reviews r JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({ message: 'Đã gửi đánh giá', review });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete review (own review only)
exports.deleteReview = (req, res) => {
    try {
        const { id } = req.params;

        const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
        }

        db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
        res.json({ message: 'Đã xóa đánh giá' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
