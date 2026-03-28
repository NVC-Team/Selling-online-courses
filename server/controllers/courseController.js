const { db } = require('../config/db');

// Get all courses (with filters)
exports.getCourses = (req, res) => {
    try {
        const { search, category, level, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT c.*, u.full_name as instructor_name, u.avatar as instructor_avatar,
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as student_count
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.status = 'approved'
        `;
        const params = [];

        if (search) {
            query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND c.category = ?';
            params.push(category);
        }
        if (level) {
            query += ' AND c.level = ?';
            params.push(level);
        }

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const totalResult = db.prepare(countQuery).get(...params);

        query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const courses = db.prepare(query).all(...params);

        res.json({
            courses,
            pagination: {
                total: totalResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get single course detail
exports.getCourseById = (req, res) => {
    try {
        const { id } = req.params;

        const course = db.prepare(`
            SELECT c.*, u.full_name as instructor_name, u.avatar as instructor_avatar, u.email as instructor_email,
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as student_count
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = ?
        `).get(id);

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        const lectures = db.prepare(
            'SELECT id, title, description, duration, order_index, is_free FROM lectures WHERE course_id = ? ORDER BY order_index'
        ).all(id);

        res.json({ course, lectures });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Create course (instructor)
exports.createCourse = (req, res) => {
    try {
        const { title, description, price, category, level } = req.body;
        const thumbnail = req.file ? `/uploads/thumbnails/${req.file.filename}` : '';

        if (!title) {
            return res.status(400).json({ message: 'Tên khóa học không được để trống' });
        }

        const result = db.prepare(`
            INSERT INTO courses (title, description, thumbnail, price, category, level, instructor_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
        `).run(title, description || '', thumbnail, price || 0, category || '', level || 'beginner', req.user.id);

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);

        res.status(201).json({ message: 'Tạo khóa học thành công', course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update course (instructor - owner only)
exports.updateCourse = (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, level } = req.body;
        const thumbnail = req.file ? `/uploads/thumbnails/${req.file.filename}` : undefined;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền sửa khóa học này' });
        }

        let query = `UPDATE courses SET updated_at = datetime('now')`;
        const params = [];

        if (title) { query += ', title = ?'; params.push(title); }
        if (description !== undefined) { query += ', description = ?'; params.push(description); }
        if (price !== undefined) { query += ', price = ?'; params.push(price); }
        if (category) { query += ', category = ?'; params.push(category); }
        if (level) { query += ', level = ?'; params.push(level); }
        if (thumbnail) { query += ', thumbnail = ?'; params.push(thumbnail); }

        query += ' WHERE id = ?';
        params.push(id);

        db.prepare(query).run(...params);

        const updatedCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        res.json({ message: 'Cập nhật khóa học thành công', course: updatedCourse });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete course (instructor owner or admin)
exports.deleteCourse = (req, res) => {
    try {
        const { id } = req.params;

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa khóa học này' });
        }

        db.prepare('DELETE FROM courses WHERE id = ?').run(id);
        res.json({ message: 'Xóa khóa học thành công' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get instructor's courses
exports.getInstructorCourses = (req, res) => {
    try {
        const courses = db.prepare(`
            SELECT c.*,
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as student_count,
                   (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE course_id = c.id AND status = 'completed') as total_revenue
            FROM courses c
            WHERE c.instructor_id = ?
            ORDER BY c.created_at DESC
        `).all(req.user.id);

        res.json({ courses });
    } catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get categories
exports.getCategories = (req, res) => {
    try {
        const categories = db.prepare(
            "SELECT DISTINCT category FROM courses WHERE category != '' AND status = 'approved' ORDER BY category"
        ).all();
        res.json({ categories: categories.map(c => c.category) });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
