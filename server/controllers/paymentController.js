const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create payment - status pending, waiting for instructor confirmation
exports.createPayment = (req, res) => {
    try {
        const { course_id, payment_method } = req.body;

        const course = db.prepare("SELECT * FROM courses WHERE id = ? AND status = 'approved'").get(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        }

        // Check if already enrolled
        const enrollment = db.prepare(
            "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND status = 'active'"
        ).get(req.user.id, course_id);

        if (enrollment) {
            return res.status(400).json({ message: 'Bạn đã đăng ký khóa học này rồi' });
        }

        // Check for existing pending payment
        const existingPayment = db.prepare(
            "SELECT id FROM payments WHERE user_id = ? AND course_id = ? AND status = 'pending'"
        ).get(req.user.id, course_id);

        if (existingPayment) {
            // Return existing pending payment info
            const payment = db.prepare(`
                SELECT p.*, c.title as course_title, c.price, u.full_name as student_name
                FROM payments p
                JOIN courses c ON p.course_id = c.id
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
            `).get(existingPayment.id);
            return res.json({ 
                message: 'Bạn đã có giao dịch đang chờ xác nhận',
                payment,
                existing: true
            });
        }

        const transaction_id = 'TXN-' + uuidv4().slice(0, 8).toUpperCase();

        const result = db.prepare(`
            INSERT INTO payments (user_id, course_id, amount, payment_method, transaction_id, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `).run(req.user.id, course_id, course.price, payment_method || 'bank_transfer', transaction_id);

        const payment = db.prepare(`
            SELECT p.*, c.title as course_title
            FROM payments p
            JOIN courses c ON p.course_id = c.id
            WHERE p.id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            message: 'Đã tạo đơn thanh toán. Vui lòng chuyển khoản và chờ giảng viên xác nhận.',
            payment
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get payment history for student
exports.getMyPayments = (req, res) => {
    try {
        const payments = db.prepare(`
            SELECT p.*, c.title as course_title, c.thumbnail
            FROM payments p
            JOIN courses c ON p.course_id = c.id
            WHERE p.user_id = ?
            ORDER BY p.paid_at DESC
        `).all(req.user.id);

        res.json({ payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get pending payments for instructor's courses
exports.getInstructorPayments = (req, res) => {
    try {
        const payments = db.prepare(`
            SELECT p.*, c.title as course_title, c.price as course_price,
                   u.full_name as student_name, u.email as student_email, u.phone as student_phone
            FROM payments p
            JOIN courses c ON p.course_id = c.id
            JOIN users u ON p.user_id = u.id
            WHERE c.instructor_id = ?
            ORDER BY 
                CASE p.status WHEN 'pending' THEN 0 ELSE 1 END,
                p.paid_at DESC
        `).all(req.user.id);

        res.json({ payments });
    } catch (error) {
        console.error('Get instructor payments error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Instructor confirms payment → enroll student
exports.confirmPayment = (req, res) => {
    try {
        const { id } = req.params;

        const payment = db.prepare(`
            SELECT p.*, c.instructor_id, c.title as course_title
            FROM payments p
            JOIN courses c ON p.course_id = c.id
            WHERE p.id = ?
        `).get(id);

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        // Only the course instructor or admin can confirm
        if (payment.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xác nhận giao dịch này' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: 'Giao dịch này đã được xử lý' });
        }

        // Update payment status to completed
        db.prepare("UPDATE payments SET status = 'completed' WHERE id = ?").run(id);

        // Auto-enroll student
        const existingEnrollment = db.prepare(
            'SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?'
        ).get(payment.user_id, payment.course_id);

        if (existingEnrollment) {
            db.prepare("UPDATE enrollments SET status = 'active', enrolled_at = datetime('now') WHERE id = ?")
                .run(existingEnrollment.id);
        } else {
            db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(payment.user_id, payment.course_id);
        }

        res.json({ message: 'Xác nhận thanh toán thành công. Học viên đã được mở khóa học.' });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Instructor rejects payment
exports.rejectPayment = (req, res) => {
    try {
        const { id } = req.params;

        const payment = db.prepare(`
            SELECT p.*, c.instructor_id
            FROM payments p
            JOIN courses c ON p.course_id = c.id
            WHERE p.id = ?
        `).get(id);

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        if (payment.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ message: 'Giao dịch này đã được xử lý' });
        }

        db.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").run(id);

        res.json({ message: 'Đã từ chối giao dịch' });
    } catch (error) {
        console.error('Reject payment error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
