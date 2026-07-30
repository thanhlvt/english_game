# Bé Học Tiếng Anh

Web app học tiếng Anh cho trẻ 5–7 tuổi người Việt. Không backend, không build step,
không dependency — mở bằng static server là chạy.

## Chạy

```bash
npm run dev      # http://localhost:5173
npm run check    # kiểm tra dữ liệu bài học
npm run smoke    # test nhanh mọi màn hình (cần npm install trước)
```

> ES module không chạy được qua `file://`, phải mở bằng http. Bất kỳ static server nào cũng được:
> `npx serve .`, `python3 -m http.server`, hoặc extension Live Server của VS Code.

## Có gì bên trong

- **7 chủ đề, 64 từ** — con vật, màu sắc, số đếm, gia đình, đồ ăn, cơ thể, thiên nhiên
- **4 dạng luyện tập** — học thẻ từ, nghe và chọn tranh, lật hình tìm cặp, xếp chữ cái
- **Xưởng kể chuyện** — bé dán hình vào tranh, ghép câu, nghe máy đọc, cất vào tủ truyện
- **Góc bố mẹ** — số từ đã thuộc, danh sách từ cần ôn, tốc độ đọc, xuất/xóa dữ liệu
- **Tiến trình lưu trong máy** bằng localStorage, có hộp Leitner để tự ưu tiên từ chưa thuộc

## Phát triển tiếp

Đọc `CLAUDE.md` trước. Bốn skill trong `.claude/skills/` hướng dẫn từng loại việc:
thêm chủ đề, thêm dạng bài tập, chuẩn nội dung cho lứa tuổi, đổi cấu trúc dữ liệu tiến trình.

## Deploy

Copy nguyên thư mục lên GitHub Pages / Netlify / Vercel. Không cần cấu hình gì.
