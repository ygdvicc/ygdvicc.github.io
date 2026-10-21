# ygdvicc.github.io

## Thêm bài nhạc vào playlist

1. Chép file MP3 mới vào thư mục `assets`.
2. Thêm một mục vào mảng trong `assets/playlist.json` (thêm dấu phẩy sau mục
   cuối hiện tại rồi chèn bài mới trước dấu `]` cuối tệp):

```json
    {
        "title": "Tên bài nhạc",
        "src": "./ten-file.mp3"
    }
```

`src` là tên file MP3 trong cùng thư mục `assets`. Giữ dấu phẩy giữa các mục
trong danh sách JSON, nhưng không thêm dấu phẩy sau mục cuối cùng.
Có thể ghi tên file bình thường, kể cả dấu cách hoặc ký tự `%`; trình phát sẽ
tự mã hóa tên file khi tạo URL.
Sau khi đẩy cả file MP3 và `playlist.json` lên Git, bài mới sẽ xuất hiện trên web.

Playlist được tải bằng HTTP(S); hãy dùng GitHub Pages hoặc máy chủ web cục bộ
để xem trang. Mở trực tiếp `index.html` bằng địa chỉ `file://` sẽ không tải được
tệp playlist do giới hạn bảo mật của trình duyệt.
