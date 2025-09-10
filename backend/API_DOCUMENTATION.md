# Chat App API Documentation

## Giới thiệu

API documentation được tạo bằng Swagger/OpenAPI 3.0 cho ứng dụng chat real-time.

## Truy cập API Documentation

Sau khi chạy server, bạn có thể truy cập documentation tại:

```
http://localhost:3000/api-docs
```

## Cách sử dụng

### 1. Authentication

Hầu hết các API đều yêu cầu authentication thông qua JWT token.

- Đầu tiên, đăng ký hoặc đăng nhập để lấy access token
- Trong Swagger UI, nhấn nút **"Authorize"** ở góc trên phải
- Nhập token theo format: `Bearer YOUR_ACCESS_TOKEN`
- Hoặc chỉ nhập `YOUR_ACCESS_TOKEN` (Swagger tự động thêm "Bearer ")

### 2. Các nhóm API chính

#### 🔐 Auth APIs
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập  
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

#### 👤 User APIs  
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/update-profile` - Cập nhật profile
- `POST /api/users/upload-avatar` - Upload avatar
- `GET /api/users/search` - Tìm kiếm user theo email

#### 👥 Friend APIs
- `GET /api/friends/list` - Danh sách bạn bè
- `POST /api/friends/add` - Gửi lời mời kết bạn
- `POST /api/friends/accept-request` - Chấp nhận lời mời
- `GET /api/friends/list-requests` - Danh sách lời mời
- `DELETE /api/friends/unfriend` - Hủy kết bạn

#### 🏠 Group APIs
- `POST /api/groups/create` - Tạo nhóm chat
- `PUT /api/groups/add-members` - Thêm thành viên
- `PUT /api/groups/remove-members` - Xóa thành viên  
- `PUT /api/groups/upload-avatar` - Upload avatar nhóm
- `PUT /api/groups/update-info` - Cập nhật thông tin nhóm
- `DELETE /api/groups/delete` - Xóa nhóm
- `PUT /api/groups/{groupId}/promote/{userId}` - Thăng cấp moderator
- `PUT /api/groups/{groupId}/demote/{userId}` - Hạ cấp thành viên
- `PUT /api/groups/{groupId}/leave` - Rời nhóm

#### 💬 Message APIs
- `GET /api/messages` - Lấy tất cả conversations
- `GET /api/messages/conversations/{conversationId}` - Chi tiết conversation
- `POST /api/messages/conversations` - Tạo conversation private
- `POST /api/messages/upload` - Upload file/media
- `POST /api/messages/send-message` - Gửi tin nhắn

### 3. Response Format

Tất cả API đều trả về JSON với format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### 4. Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (lỗi validation)
- `401` - Unauthorized (chưa xác thực)
- `403` - Forbidden (không có quyền)
- `404` - Not Found
- `500` - Internal Server Error

### 5. File Upload

Các endpoint upload file sử dụng `multipart/form-data`:

- `POST /api/users/upload-avatar` - Upload avatar user
- `PUT /api/groups/upload-avatar` - Upload avatar nhóm  
- `POST /api/messages/upload` - Upload file/media cho tin nhắn

### 6. Pagination

Các API list data hỗ trợ pagination:

```
GET /api/friends/list?page=1&limit=20
GET /api/messages?page=1&limit=10
```

Response bao gồm thông tin pagination:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Testing

1. Mở Swagger UI tại `http://localhost:3000/api-docs`
2. Test endpoint `POST /api/auth/register` để tạo tài khoản
3. Test endpoint `POST /api/auth/login` để lấy token
4. Authorize bằng token vừa lấy được
5. Test các endpoint khác

## Notes

- Tất cả timestamps được trả về dưới dạng ISO 8601
- File upload giới hạn kích thước (cần check trong middleware)
- Token có thời hạn (cần refresh khi hết hạn)
- WebSocket endpoints cho real-time messaging không có trong Swagger (cần document riêng)

---

**Chúc bạn code vui vẻ! 🚀**
