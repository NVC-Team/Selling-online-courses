# EduPlatform - Nền tảng học trực tuyến

EduPlatform là một nền tảng học trực tuyến hiện đại với giao diện nữ tính, chuyên nghiệp. Hệ thống cho phép:
- **Người dùng (Học viên):** Xem danh sách khóa học, mua khóa học, học qua video (hỗ trợ Youtube thumbnails), đánh giá/bình luận khóa học, và theo dõi tiến độ.
- **Giảng viên:** Tạo và quản lý khóa học của mình, quản lý học viên.
- **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống, khóa học, người dùng và duyệt doanh thu.

## 🛠️ Trình độ & Công nghệ
- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** SQLite (cơ sở dữ liệu lưu trong file `.db` gọn nhẹ, không cần setup container SQL phức tạp)

---

## 🚀 Hướng dẫn cài đặt và chạy máy cục bộ (Local Development)

Để chạy dự án này trên máy của bạn (hoặc máy khác), hãy làm theo các bước sau:

### 1. Yêu cầu hệ thống
- Cài đặt **Node.js** (phiên bản 18+ trở lên). Có thể tải tại: [nodejs.org](https://nodejs.org/)
- **Git** để clone dự án.

### 2. Tải mã nguồn
Clone dự án về máy của bạn:

```bash
git clone https://github.com/NVC-Team/Selling-online-courses.git
cd Selling-online-courses
```

### 3. Cài đặt và chạy Backend (Server)

Mở một Terminal (Command Prompt / PowerShell) và chạy các lệnh:

```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt tất cả các thư viện cần thiết
npm install

# Khởi chạy server
npm start
```
*Lưu ý: Server sẽ chạy ở cổng `5000` (`http://localhost:5000`). Database được khởi tạo tự động ở file `server/database/database.sqlite` thông qua cấu hình trong thư mục `config`.*

### 4. Cài đặt và chạy Frontend (Client)

Mở một Terminal **mới** (trong khi terminal server vẫn đang chạy) và thực hiện các lệnh:

```bash
# Từ thư mục gốc, chuyển vào thư mục client
cd client

# Cài đặt các gói phụ thuộc
npm install

# Chạy bản phát triển (development server)
npm run dev
```
*Frontend sẽ chạy trên cổng `5173` (`http://localhost:5173`).*

---

## 🔑 Tài khoản Test Mặc định

Bạn có thể đăng nhập bằng các tài khoản sau để test các quyền khác nhau (Cấu hình trước nếu có trong database):

- **Học viên:** (Vui lòng tự đăng ký tài khoản mới trên giao diện)
- **Giảng viên / Admin:** (Liên hệ hoặc xem lại thông tin database)

---

## 🌈 Điểm nổi bật ở phiên bản hiện tại
1. Tự động lấy **Thumbnail YouTube** thay vì ảnh xám trống.
2. Giao diện thay đổi theo xu hướng hiện đại, **Feminine Theme** (Rose/Lavender) thanh lịch.
3. Chức năng **Đánh giá khóa học** (Review / Rating) sau khi mua / tham gia khóa học.
4. Cơ chế chia tab khóa học (Đã duyệt / Chờ duyệt / Quản lý).
