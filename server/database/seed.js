const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('../config/db');

// Initialize database first
initDatabase();

console.log('🌱 Seeding database...');

// Clean existing data for re-seeding
db.prepare('DELETE FROM lecture_progress').run();
db.prepare('DELETE FROM payments').run();
db.prepare('DELETE FROM enrollments').run();
db.prepare('DELETE FROM lectures').run();
db.prepare('DELETE FROM courses').run();
db.prepare('DELETE FROM users').run();

// Create admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
db.prepare(
    "INSERT INTO users (full_name, email, password, role) VALUES ('Admin', 'admin@example.com', ?, 'admin')"
).run(adminPassword);

// Create instructor users
const instructorPassword = bcrypt.hashSync('instructor123', 10);
const instructors = [
    { name: 'Nguyễn Văn A', email: 'instructor1@example.com' },
    { name: 'Trần Thị B', email: 'instructor2@example.com' },
];

instructors.forEach(i => {
    db.prepare(
        "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'instructor')"
    ).run(i.name, i.email, instructorPassword);
});

// Create student users
const studentPassword = bcrypt.hashSync('student123', 10);
const students = [
    { name: 'Lê Văn C', email: 'student1@example.com' },
    { name: 'Phạm Thị D', email: 'student2@example.com' },
    { name: 'Hoàng Văn E', email: 'student3@example.com' },
];

students.forEach(s => {
    db.prepare(
        "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'student')"
    ).run(s.name, s.email, studentPassword);
});

// Get instructor IDs
const instructor1 = db.prepare("SELECT id FROM users WHERE email = 'instructor1@example.com'").get();
const instructor2 = db.prepare("SELECT id FROM users WHERE email = 'instructor2@example.com'").get();

// Create courses
const courses = [
    {
        title: 'Lập trình React từ cơ bản đến nâng cao',
        description: 'Khóa học toàn diện về React.js, từ các khái niệm cơ bản như Component, Props, State đến các kỹ thuật nâng cao như Hooks, Context API, và Redux. Bạn sẽ xây dựng nhiều dự án thực tế.',
        price: 599000,
        category: 'Lập trình Web',
        level: 'beginner',
        instructor_id: instructor1.id,
        status: 'approved'
    },
    {
        title: 'Node.js và Express - Xây dựng REST API',
        description: 'Học cách xây dựng backend mạnh mẽ với Node.js và Express. Khóa học bao gồm authentication, database, file upload, và deployment.',
        price: 499000,
        category: 'Lập trình Web',
        level: 'intermediate',
        instructor_id: instructor1.id,
        status: 'approved'
    },
    {
        title: 'Python cho Data Science',
        description: 'Khám phá thế giới Data Science với Python. Học NumPy, Pandas, Matplotlib, và Machine Learning cơ bản.',
        price: 799000,
        category: 'Data Science',
        level: 'beginner',
        instructor_id: instructor2.id,
        status: 'approved'
    },
    {
        title: 'UI/UX Design Masterclass',
        description: 'Tìm hiểu nguyên lý thiết kế UI/UX, sử dụng Figma, tạo wireframe, mockup, và prototype. Xây dựng portfolio ấn tượng.',
        price: 699000,
        category: 'Thiết kế',
        level: 'beginner',
        instructor_id: instructor2.id,
        status: 'approved'
    },
    {
        title: 'Machine Learning với TensorFlow',
        description: 'Xây dựng các mô hình Machine Learning và Deep Learning với TensorFlow 2.0. Bao gồm CNN, RNN, và Transfer Learning.',
        price: 999000,
        category: 'AI & Machine Learning',
        level: 'advanced',
        instructor_id: instructor1.id,
        status: 'approved'
    },
    {
        title: 'Flutter Mobile App Development',
        description: 'Xây dựng ứng dụng di động đa nền tảng với Flutter và Dart. Tạo UI đẹp, xử lý state, và tích hợp Firebase.',
        price: 649000,
        category: 'Mobile Development',
        level: 'intermediate',
        instructor_id: instructor2.id,
        status: 'approved'
    },
    {
        title: 'Docker & Kubernetes nâng cao',
        description: 'Khóa học chuyên sâu về containerization và orchestration. Docker Compose, Kubernetes, CI/CD, và microservices.',
        price: 849000,
        category: 'DevOps',
        level: 'advanced',
        instructor_id: instructor1.id,
        status: 'pending'
    },
    {
        title: 'SQL Database Design',
        description: 'Thiết kế database chuyên nghiệp, normalization, index, stored procedures, và tối ưu query.',
        price: 399000,
        category: 'Cơ sở dữ liệu',
        level: 'beginner',
        instructor_id: instructor2.id,
        status: 'approved'
    },
];

courses.forEach(c => {
    db.prepare(
        "INSERT INTO courses (title, description, price, category, level, instructor_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(c.title, c.description, c.price, c.category, c.level, c.instructor_id, c.status);
});

// Add lectures to courses
const courseIds = db.prepare("SELECT id FROM courses WHERE status = 'approved'").all();

const sampleLectures = [
    ['Giới thiệu khóa học', 'Tổng quan về khóa học và những gì bạn sẽ học được', 15, 1],
    ['Cài đặt môi trường', 'Hướng dẫn cài đặt các công cụ cần thiết', 20, 1],
    ['Bài giảng 1: Khái niệm cơ bản', 'Tìm hiểu các khái niệm nền tảng', 45, 0],
    ['Bài giảng 2: Thực hành đầu tiên', 'Bắt tay vào code với bài tập đầu tiên', 60, 0],
    ['Bài giảng 3: Kiến thức nâng cao', 'Đi sâu vào các khái niệm nâng cao', 50, 0],
    ['Bài giảng 4: Dự án thực tế', 'Xây dựng dự án thực tế từ đầu đến cuối', 90, 0],
    ['Tổng kết và bài tập', 'Ôn tập kiến thức và bài tập tổng hợp', 30, 0],
];

courseIds.forEach(course => {
    sampleLectures.forEach((lecture, index) => {
        db.prepare(`
            INSERT INTO lectures (course_id, title, description, duration, order_index, is_free)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(course.id, lecture[0], lecture[1], lecture[2], index + 1, lecture[3]);
    });

    // Update course totals
    db.prepare(`
        UPDATE courses SET total_lectures = ?, total_duration = ?
        WHERE id = ?
    `).run(sampleLectures.length, sampleLectures.reduce((sum, l) => sum + l[2], 0), course.id);
});

// Create some enrollments
const student1 = db.prepare('SELECT id FROM users WHERE email = ?').get('student1@example.com');
const student2 = db.prepare('SELECT id FROM users WHERE email = ?').get('student2@example.com');

if (student1 && courseIds.length >= 2) {
    db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, ?)')
        .run(student1.id, courseIds[0].id, 42);
    db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, ?)')
        .run(student1.id, courseIds[1].id, 15);
    
    // Create payment records
    db.prepare(`
        INSERT INTO payments (user_id, course_id, amount, payment_method, transaction_id, status)
        VALUES (?, ?, 599000, 'credit_card', 'TXN-DEMO0001', 'completed')
    `).run(student1.id, courseIds[0].id);
    db.prepare(`
        INSERT INTO payments (user_id, course_id, amount, payment_method, transaction_id, status)
        VALUES (?, ?, 499000, 'momo', 'TXN-DEMO0002', 'completed')
    `).run(student1.id, courseIds[1].id);
}

if (student2 && courseIds.length >= 3) {
    db.prepare('INSERT OR IGNORE INTO enrollments (user_id, course_id, progress_percent) VALUES (?, ?, ?)')
        .run(student2.id, courseIds[2].id, 70);
    
    db.prepare(`
        INSERT INTO payments (user_id, course_id, amount, payment_method, transaction_id, status)
        VALUES (?, ?, 799000, 'bank_transfer', 'TXN-DEMO0003', 'completed')
    `).run(student2.id, courseIds[2].id);
}

console.log('✅ Seed data created successfully!');
console.log('\n📋 Test accounts:');
console.log('  Admin:      admin@example.com / admin123');
console.log('  Instructor: instructor1@example.com / instructor123');
console.log('  Student:    student1@example.com / student123');
