# Web Monitor

Ứng dụng Node.js/Express theo dõi trạng thái HTTP, thời gian phản hồi và thay đổi nội dung website. Dữ liệu được lưu bằng SQLite trong volume `web_monitor_data`.

## API chính
- `GET /health`
- `GET/POST /api/monitors`
- `GET/PUT/DELETE /api/monitors/:id`
- `POST /api/monitors/:id/check`

## Chạy local

Ứng dụng lắng nghe `0.0.0.0:8080`, endpoint health là `/health`. Cần Node.js 20 trở lên.
