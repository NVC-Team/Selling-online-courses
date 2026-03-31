-- Schema for Course Registration Platform (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    role TEXT CHECK(role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    is_active INTEGER DEFAULT 1,
    reset_token TEXT DEFAULT NULL,
    reset_token_expiry TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    price REAL DEFAULT 0,
    category TEXT DEFAULT '',
    level TEXT CHECK(level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    instructor_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
    total_lectures INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    intro_video_url TEXT DEFAULT '',
    duration_days INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS lectures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TEXT DEFAULT (datetime('now')),
    status TEXT CHECK(status IN ('active', 'completed', 'cancelled', 'expired')) DEFAULT 'active',
    progress_percent REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lecture_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lecture_id INTEGER NOT NULL,
    is_completed INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lecture_id) REFERENCES lectures(id),
    UNIQUE(user_id, lecture_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'credit_card',
    transaction_id TEXT UNIQUE,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    paid_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(user_id, course_id)
);
