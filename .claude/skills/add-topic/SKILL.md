---
name: add-topic
description: Thêm chủ đề bài học hoặc từ vựng mới vào app Bé Học Tiếng Anh. Dùng khi người dùng nói "thêm chủ đề", "thêm bài học", "thêm từ vựng", "thêm bộ từ về X", hoặc muốn mở rộng nội dung học. Không dùng khi thêm dạng bài tập mới (xem add-activity).
---

# Thêm chủ đề / từ vựng

## Bước 1 — Kiểm tra trước khi viết

- Chủ đề đã tồn tại chưa? Xem `content/index.js`.
- Từ định thêm đã có ở chủ đề khác chưa? `grep -r "en: 'word'" content/topics/`
- Chủ đề mới cần **ít nhất 6 từ** (hoạt động Lật hình tìm cặp cần 6 cặp).

## Bước 2 — Tạo file `content/topics/<id>.js`

```js
export default {
  id: 'school',          // kebab-case, trùng tên file, KHÔNG BAO GIỜ đổi về sau
  vi: 'Trường học',
  en: 'School',
  icon: '🎒',
  level: 2,              // 1 dễ → 3 khó
  words: [
    { id: 'book',   en: 'book',   vi: 'quyển sách', emoji: '📕', sentence: 'I read a book.' },
    { id: 'pen',    en: 'pen',    vi: 'cái bút',    emoji: '🖊️' },
    // ... tối thiểu 6 từ
  ]
};
```

Căn thẳng cột như các file có sẵn — dễ soát lỗi bằng mắt hơn nhiều.

## Bước 3 — Đăng ký

Trong `content/index.js`: thêm `import school from './topics/school.js';` rồi thêm `school`
vào mảng `TOPICS`, **đặt đúng vị trí theo `level`** (dễ trước, khó sau) vì mảng này quyết
định thứ tự hiển thị ở trang chủ.

## Bước 4 — Kiểm tra

```bash
npm run check
```

Sửa hết dòng `✗`. Dòng `⚠` chỉ là gợi ý, cân nhắc rồi bỏ qua được.

## Ràng buộc bắt buộc

- `id` chủ đề và `id` từ là **khóa lưu tiến trình**. Đổi id = xóa sạch dữ liệu học của từ đó.
  Muốn sửa chính tả tên hiển thị thì sửa `vi`/`en`, giữ nguyên `id`.
- `en` tối đa 9 chữ cái. Từ ≤ 6 chữ cái mới vào được hoạt động Xếp chữ cái — mỗi chủ đề nên
  có ít nhất 5 từ ngắn như vậy.
- **Mỗi từ một emoji khác nhau trong cùng chủ đề.** Trùng emoji làm hoạt động Nghe và chọn
  không có đáp án đúng duy nhất.
- Ưu tiên emoji đơn codepoint. Emoji ghép (👨‍👩‍👧‍👦) hiển thị lệch giữa Android và iOS.
- Từ trừu tượng không có emoji rõ nghĩa (`happy`, `think`, `nice`) thì **đừng thêm** —
  hoặc thêm ảnh thật qua trường `image`.

## Sau khi thêm

Nếu chủ đề mới có danh từ chỉ người/con vật, cân nhắc thêm chúng vào danh sách chủ ngữ của
Xưởng kể chuyện: sửa hàm `subjects()` trong `src/activities/story-studio.js`.
