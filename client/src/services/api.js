const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
    const { method = 'GET', body, isFormData = false } = options;

    const headers = { ...authHeaders() };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const config = { method, headers };
    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
    }

    return data;
}

// Auth API
export const authAPI = {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    getProfile: () => request('/auth/profile'),
    updateProfile: (formData) => request('/auth/profile', { method: 'PUT', body: formData, isFormData: true }),
    changePassword: (current_password, new_password) => request('/auth/change-password', { method: 'PUT', body: { current_password, new_password } }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, new_password) => request('/auth/reset-password', { method: 'POST', body: { token, new_password } }),
};

// Course API
export const courseAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/courses?${query}`);
    },
    getById: (id) => request(`/courses/${id}`),
    getCourseById: (id) => request(`/courses/${id}`),
    getCategories: () => request('/courses/categories'),
    create: (formData) => request('/courses', { method: 'POST', body: formData, isFormData: true }),
    update: (id, formData) => request(`/courses/${id}`, { method: 'PUT', body: formData, isFormData: true }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
    getInstructorCourses: () => request('/courses/instructor/my-courses'),
};

// Lecture API
export const lectureAPI = {
    getByCourse: (courseId) => request(`/lectures/course/${courseId}`),
    getById: (id) => request(`/lectures/${id}`),
    create: (courseId, data) => request(`/lectures/course/${courseId}`, { method: 'POST', body: data }),
    update: (id, data) => request(`/lectures/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/lectures/${id}`, { method: 'DELETE' }),
};

// Enrollment API
export const enrollmentAPI = {
    enroll: (course_id) => request('/enrollments', { method: 'POST', body: { course_id } }),
    getMyEnrollments: () => request('/enrollments/my-courses'),
    cancel: (id) => request(`/enrollments/${id}/cancel`, { method: 'PUT' }),
    getCourseStudents: (courseId) => request(`/enrollments/course/${courseId}/students`),
    addStudent: (courseId, email) => request(`/enrollments/course/${courseId}/add-student`, { method: 'POST', body: { email } }),
    removeStudent: (courseId, userId) => request(`/enrollments/course/${courseId}/student/${userId}`, { method: 'DELETE' }),
};

// Progress API
export const progressAPI = {
    update: (lecture_id, watch_time, is_completed) => request('/progress', { method: 'POST', body: { lecture_id, watch_time, is_completed } }),
    getCourseProgress: (courseId) => request(`/progress/course/${courseId}`),
};

// Payment API
export const paymentAPI = {
    create: (course_id, payment_method) => request('/payments', { method: 'POST', body: { course_id, payment_method } }),
    getMyPayments: () => request('/payments/my-payments'),
    getInstructorPayments: () => request('/payments/instructor/pending'),
    confirmPayment: (id) => request(`/payments/${id}/confirm`, { method: 'PUT' }),
    rejectPayment: (id) => request(`/payments/${id}/reject`, { method: 'PUT' }),
};

// Review API
export const reviewAPI = {
    getCourseReviews: (courseId) => request(`/reviews/course/${courseId}`),
    createReview: (courseId, rating, comment) => request(`/reviews/course/${courseId}`, { method: 'POST', body: { rating, comment } }),
    deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
};

// Admin API
export const adminAPI = {
    getDashboard: () => request('/admin/dashboard'),
    getAllCourses: (status) => request(`/admin/courses${status ? `?status=${status}` : ''}`),
    updateCourseStatus: (id, status) => request(`/admin/courses/${id}/status`, { method: 'PUT', body: { status } }),
    getAllUsers: () => request('/admin/users'),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
    toggleUserActive: (id) => request(`/admin/users/${id}/toggle-active`, { method: 'PUT' }),
    getRevenue: () => request('/admin/revenue'),
};
