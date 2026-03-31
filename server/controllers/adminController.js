const { db } = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all courses for admin (including pending)
exports.getAllCourses = (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT c.*, u.full_name as instructor_name,
                   (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as student_count
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
        `;
        const params = [];

        if (status) {
            query += ' WHERE c.status = ?';
            params.push(status);
        }

        query += ' ORDER BY c.created_at DESC';

        const courses = db.prepare(query).all(...params);
        res.json({ courses });
    } catch (error) {
        console.error('Admin get courses error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Approve/Reject course
exports.updateCourseStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        db.prepare(`UPDATE courses SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);

        const statusText = status === 'approved' ? 'duyệt' : 'từ chối';
        res.json({ message: `Đã ${statusText} khóa học` });
    } catch (error) {
        console.error('Update course status error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get all users
exports.getAllUsers = (req, res) => {
    try {
        const users = db.prepare(
            'SELECT id, full_name, email, phone, avatar, role, is_active, created_at FROM users ORDER BY created_at DESC'
        ).all();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update user role
exports.updateUserRole = (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        db.prepare(`UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?`).run(role, id);
        res.json({ message: 'Cập nhật vai trò thành công' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Toggle user active status
exports.toggleUserActive = (req, res) => {
    try {
        const { id } = req.params;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const newStatus = user.is_active ? 0 : 1;
        db.prepare(`UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?`).run(newStatus, id);

        res.json({ message: newStatus ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản' });
    } catch (error) {
        console.error('Toggle active error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get revenue statistics
exports.getRevenue = (req, res) => {
    try {
        // Total revenue
        const totalRevenue = db.prepare(
            "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
        ).get();

        // Revenue by month (last 12 months)
        const monthlyRevenue = db.prepare(`
            SELECT strftime('%Y-%m', paid_at) as month,
                   SUM(amount) as revenue,
                   COUNT(*) as transactions
            FROM payments
            WHERE status = 'completed'
            GROUP BY strftime('%Y-%m', paid_at)
            ORDER BY month DESC
            LIMIT 12
        `).all();

        // Revenue by course
        const courseRevenue = db.prepare(`
            SELECT c.title, c.id as course_id,
                   COALESCE(SUM(p.amount), 0) as revenue,
                   COUNT(p.id) as sales
            FROM courses c
            LEFT JOIN payments p ON c.id = p.course_id AND p.status = 'completed'
            GROUP BY c.id
            ORDER BY revenue DESC
            LIMIT 10
        `).all();

        // Stats
        const stats = {
            totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
            totalCourses: db.prepare("SELECT COUNT(*) as count FROM courses WHERE status = 'approved'").get().count,
            totalEnrollments: db.prepare("SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'").get().count,
            totalRevenue: totalRevenue.total,
            pendingCourses: db.prepare("SELECT COUNT(*) as count FROM courses WHERE status = 'pending'").get().count
        };

        res.json({ stats, monthlyRevenue, courseRevenue });
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Reset user password to default (1234)
exports.resetUserPassword = (req, res) => {
    try {
        const { id } = req.params;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const hashedPassword = bcrypt.hashSync('1234', 10);
        db.prepare(`UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?`).run(hashedPassword, id);

        res.json({ message: 'Đã đặt lại mật khẩu về 1234' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Dashboard overview
exports.getDashboard = (req, res) => {
    try {
        const stats = {
            totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
            totalStudents: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count,
            totalInstructors: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'instructor'").get().count,
            totalCourses: db.prepare('SELECT COUNT(*) as count FROM courses').get().count,
            approvedCourses: db.prepare("SELECT COUNT(*) as count FROM courses WHERE status = 'approved'").get().count,
            pendingCourses: db.prepare("SELECT COUNT(*) as count FROM courses WHERE status = 'pending'").get().count,
            totalEnrollments: db.prepare("SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'").get().count,
            totalRevenue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'").get().total
        };

        const recentUsers = db.prepare(
            'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        ).all();

        const recentCourses = db.prepare(`
            SELECT c.id, c.title, c.status, c.created_at, u.full_name as instructor_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            ORDER BY c.created_at DESC LIMIT 5
        `).all();

        res.json({ stats, recentUsers, recentCourses });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

