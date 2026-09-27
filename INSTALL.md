# Cài đặt SoloHost

1. Publish image công khai, versioned lên GHCR.
2. Đặt `WEB_MONITOR_IMAGE` trong form cấu hình thành image thực tế, ví dụ `ghcr.io/OWNER/web-monitor:1.0.0`.
3. Giữ `HOST_PORT=18080` nếu không cần đổi cổng.
4. SoloHost sẽ kéo image và khởi động container; không build source trên máy chủ.
5. Mở `http://127.0.0.1:18080` và kiểm tra `/health` trả về JSON `{"ok":true}`.

Không cần API key cho ứng dụng local. Không đưa `.env` hoặc secrets vào image/source.
