---
name: add-activity
description: Thêm một dạng bài tập/trò chơi mới vào app Bé Học Tiếng Anh. Dùng khi người dùng nói "thêm trò chơi", "thêm dạng bài", "thêm hoạt động", "làm game nối từ", "làm bài nghe câu", hoặc muốn thêm cách luyện tập mới. Không dùng khi chỉ thêm từ vựng (xem add-topic).
---

# Thêm hoạt động mới

## Hợp đồng module

Tạo `src/activities/<id>.js` export default một object đúng dạng sau:

```js
import { paint, topBar, on, confetti, refreshStars } from '../core/ui.js';
import { sayWord, sfx } from '../core/audio.js';
import { recordAnswer, addStars, recordPlay } from '../core/storage.js';
import { pickQuestion } from '../core/content.js';

export default {
  id: 'word-pick',                    // kebab-case, ổn định (là khóa thống kê lượt chơi)
  vi: 'Nhìn tranh chọn chữ',          // tên cho bé, tiếng Việt
  desc: 'Nhìn tranh rồi chọn từ đúng',
  icon: '🔍',
  minWords: 3,                        // số từ tối thiểu chủ đề phải có
  standalone: false,                  // true = không gắn với chủ đề nào

  mount({ topic, back }) {
    const self = this;
    let timers = [];
    recordPlay(topic.id, self.id);

    function draw() {
      const q = pickQuestion(topic, 2);
      paint(topBar(self.icon + ' ' + self.vi, back) + `...HTML...`);
      on('.opt', el => { /* xử lý chạm */ });
    }

    draw();
    return () => timers.forEach(clearTimeout);   // cleanup, router sẽ gọi khi đổi màn
  }
};
```

Đăng ký trong `src/activities/index.js`: import rồi thêm vào mảng `ACTIVITIES`.
Thứ tự trong mảng = thứ tự hiện trong menu chủ đề, xếp từ dễ đến khó.

## Bắt buộc

- **Chọn từ bằng `pickWords()` / `pickQuestion()`** của `core/content.js`. Không tự
  `Math.random()` trên `topic.words` — sẽ phá quy luật ôn tập Leitner của cả app.
- **Ghi kết quả**: đúng → `recordAnswer(topic.id, wordId, true)` + `addStars(n)` + `refreshStars()`.
  Sai → `recordAnswer(topic.id, wordId, false)`. Chỉ xem, không hỏi → truyền `null`.
- **Trả về hàm cleanup** nếu có `setTimeout` hoặc listener gắn ngoài `#app`.
- **Chỉ dùng class có sẵn trong `components.css`.** Cần style mới thì thêm vào cuối
  `components.css` kèm bình luận tên hoạt động, và chỉ dùng biến từ `tokens.css`.
- Mỗi lần vẽ lại phải gọi `paint()` (nó tự xóa `#app` và cuộn lên đầu), không tự
  `innerHTML +=`.

## Luật thiết kế cho lứa 5–7 tuổi

- Không đồng hồ đếm ngược, không giới hạn lượt, không màn hình thua.
- Sai thì rung nhẹ (`class="wrong"`) + `sfx.no()` rồi cho thử lại ngay. Không hiện chữ "Sai".
- Đúng thì `sfx.ok()` + `confetti()` + phát âm lại từ đó — âm thanh là phần thưởng chính.
- Luôn có nút 🔊 nghe lại, đặt to và dễ bấm.
- Mọi nút ≥ 56px (`--touch`). Tối đa 3–4 lựa chọn trên một màn hình.
- Hướng dẫn bằng 1 câu tiếng Việt ngắn trong `.prompt`, kèm icon.

## Kiểm tra trước khi xong

1. Chơi thử trên viewport 360px — không tràn ngang.
2. Vào rồi thoát giữa chừng nhiều lần — không còn timer chạy nền, không nghe tiếng đọc chồng nhau.
3. Tắt loa hệ thống — vẫn chơi được bình thường.
4. Vào Góc bố mẹ xem số liệu có tăng đúng không.
