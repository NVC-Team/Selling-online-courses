const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

// Register
exports.register = (req, res) => {
    try {
        const { full_name, email, password, phone, role } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const userRole = ['student', 'instructor'].includes(role) ? role : 'student';

        const result = db.prepare(
            'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)'
        ).run(full_name, email, hashedPassword, phone || '', userRole);

        const user = db.prepare('SELECT id, full_name, email, role, avatar, phone, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
        const token = generateToken(user);

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Login
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = generateToken(user);
        const { password: _, reset_token: __, reset_token_expiry: ___, ...safeUser } = user;

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: safeUser
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Get current user profile
exports.getProfile = (req, res) => {
    try {
        const user = db.prepare(
            'SELECT id, full_name, email, phone, avatar, role, is_active, created_at FROM users WHERE id = ?'
        ).get(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Update profile
exports.updateProfile = (req, res) => {
    try {
        const { full_name, phone } = req.body;
        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

        let query = `UPDATE users SET updated_at = datetime('now')`;
        const params = [];

        if (full_name) { query += ', full_name = ?'; params.push(full_name); }
        if (phone !== undefined) { query += ', phone = ?'; params.push(phone); }
        if (avatar) { query += ', avatar = ?'; params.push(avatar); }

        query += ' WHERE id = ?';
        params.push(req.user.id);

        db.prepare(query).run(...params);

        const user = db.prepare(
            'SELECT id, full_name, email, phone, avatar, role, created_at FROM users WHERE id = ?'
        ).get(req.user.id);

        res.json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Change password
exports.changePassword = (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
        const isMatch = bcrypt.compareSync(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = bcrypt.hashSync(new_password, 10);
        db.prepare(`UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?`)
            .run(hashedPassword, req.user.id);

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Forgot password (mock - returns reset token)
exports.forgotPassword = (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });
        }

        const resetToken = uuidv4();
        const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
            .run(resetToken, expiry, user.id);

        console.log(`🔑 Reset token for ${email}: ${resetToken}`);

        res.json({
            message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
            // In development, return the token for testing
            reset_token: resetToken
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Reset password
exports.resetPassword = (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({ message: 'Thiếu thông tin' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = db.prepare(
            `SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > datetime('now')`
        ).get(token);

        if (!user) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        const hashedPassword = bcrypt.hashSync(new_password, 10);
        db.prepare(
            `UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = datetime('now') WHERE id = ?`
        ).run(hashedPassword, user.id);

        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
