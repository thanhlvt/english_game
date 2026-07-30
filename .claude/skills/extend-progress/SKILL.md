---
name: extend-progress
description: Đổi hoặc mở rộng cấu trúc dữ liệu tiến trình học lưu trong localStorage của app Bé Học Tiếng Anh. Dùng khi cần thêm trường mới (huy hiệu, chuỗi ngày học, nhiều hồ sơ trẻ), đổi cách tính độ thuộc, viết migration, hoặc sửa lỗi mất dữ liệu.
---

# Mở rộng dữ liệu tiến trình

Toàn bộ nằm trong `src/core/storage.js`, khóa `bhta:progress`. **Không file nào khác được
gọi `localStorage` trực tiếp** — nếu thấy chỗ nào vi phạm thì sửa lại thành import từ đây.

## Thêm một trường mới

1. Thêm vào `EMPTY()` với giá trị mặc định hợp lý.
2. **Tăng `VERSION`** lên 1 đơn vị.
3. Thêm nhánh vào `migrate()` để nâng cấp dữ liệu cũ:

```js
function migrate(data) {
  if (!data || typeof data !== 'object') return EMPTY();
  if (data.v === 1) { data.badges = []; data.v = 2; }   // nhánh mới
  if (data.v === VERSION) return { ...EMPTY(), ...data };
  return { ...EMPTY(), ...data, v: VERSION };
}
```

4. Viết hàm đọc/ghi có tên rõ nghĩa và export ra, ví dụ `awardBadge(id)` / `listBadges()`.
   Không export biến `cache` ra ngoài.

## Nguyên tắc bắt buộc

- **Migration chỉ được thêm, không được xóa.** Dữ liệu của trẻ không thể lấy lại được.
- **Mọi truy cập bọc trong `try/catch`.** Chế độ ẩn danh và Safari khóa riêng tư sẽ ném lỗi
  ngay ở `localStorage.getItem`. Khi đó `failed = true`, app chuyển sang bộ nhớ tạm và
  `isPersistent()` trả `false` — màn hình phải hiện cảnh báo cho bố mẹ.
- **Giữ dữ liệu nhỏ.** Quota thường là 5MB. Danh sách truyện đã chặn ở 20 bản gần nhất;
  bất kỳ mảng nào tự tăng cũng phải có giới hạn tương tự.
- **Ghi sau mỗi thay đổi** bằng `save()`. Không gom lại ghi một lần vì bé hay đóng tab đột ngột.
- **Khóa từ vựng là `topicId.wordId`.** Đổi id trong `content/` sẽ mồ côi dữ liệu cũ. Nếu buộc
  phải đổi, viết migration ánh xạ khóa cũ sang khóa mới trong cùng lần tăng `VERSION`.

## Nếu đổi thuật toán độ thuộc

`box` là hộp Leitner 0–4, tăng khi đúng, giảm khi sai, dùng ở 3 chỗ:
`content.pickWords()` (chọn từ để luyện), `storage.topicMastery()` (thanh % ở trang chủ),
`screens/parent.js` (danh sách từ cần ôn). Đổi thang điểm thì phải sửa cả ba, và migration
phải quy đổi giá trị cũ sang thang mới thay vì đặt lại về 0.

## Kiểm tra sau khi sửa

```bash
npm run dev
```

1. Mở app với dữ liệu cũ (đừng xóa localStorage) — không văng lỗi, số liệu cũ còn nguyên.
2. Vào Góc bố mẹ, bấm **Tải bản sao dữ liệu**, mở file JSON xem `v` đã tăng và trường mới có mặt.
3. Mở tab ẩn danh — app vẫn chạy, có dòng cảnh báo không lưu được.
4. Bấm **Xóa toàn bộ tiến trình** rồi tải lại — về trạng thái trắng, không lỗi.
