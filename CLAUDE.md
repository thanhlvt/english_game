# Bé Học Tiếng Anh — hướng dẫn cho Claude Code

Web app dạy tiếng Anh cho trẻ **5–7 tuổi người Việt**. Không backend, không build step,
không dependency. Toàn bộ tiến trình lưu trong `localStorage` của thiết bị.

## Chạy dự án

```bash
npm run dev      # mở http://localhost:5173  (bắt buộc dùng http, ES module không chạy qua file://)
npm run check    # kiểm tra dữ liệu bài học, chạy trước mọi commit
npm install      # chỉ cần cho lệnh smoke bên dưới (jsdom là devDependency duy nhất)
npm run smoke    # render mọi màn hình bằng jsdom, bắt lỗi runtime mà không cần mở trình duyệt
```

Deploy: copy nguyên thư mục lên bất kỳ static host nào (GitHub Pages, Netlify, Vercel).

## Bản đồ mã nguồn

```
index.html                 vỏ trang, nạp CSS + src/main.js
src/main.js                khai báo route, điểm khởi động duy nhất
src/core/
  router.js                router theo hash, gọi cleanup khi đổi màn
  content.js               đọc /content, kiểm tra dữ liệu, CHỌN TỪ theo Leitner
  storage.js               cổng DUY NHẤT vào localStorage
  audio.js                 phát âm (TTS hoặc file mp3) + hiệu ứng âm thanh
  ui.js                    paint/topBar/confetti/doneBox + tiện ích chung
src/activities/            mỗi hoạt động = 1 file + đăng ký trong index.js
src/screens/               home (chọn chủ đề), topic (chọn hoạt động), parent (góc bố mẹ)
src/styles/                tokens.css → base.css → components.css
content/index.js           danh mục chủ đề
content/topics/*.js        DỮ LIỆU BÀI HỌC, mỗi chủ đề 1 file
tools/validate-content.mjs trình kiểm tra dữ liệu
tools/smoke.mjs            render mọi màn hình bằng jsdom để bắt lỗi runtime
```

Luồng: `hash` → `router` → screen hoặc `activity.mount()` → `ui.paint()` ghi vào `#app`.

## Hợp đồng dữ liệu

### Chủ đề (`content/topics/<id>.js`)

```js
export default {
  id: 'animals',        // kebab-case, DUY NHẤT, ỔN ĐỊNH — là khóa lưu tiến trình, đổi = mất dữ liệu
  vi: 'Con vật',        // tên hiển thị cho bé
  en: 'Animals',
  icon: '🐘',
  level: 1,             // 1 dễ → 3 khó, dùng để xếp thứ tự
  words: [ /* xem dưới */ ]
};
```

### Từ vựng

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `id` | ✔ | kebab-case, duy nhất **trong chủ đề**, ổn định |
| `en` | ✔ | chữ thường, tối đa 9 chữ cái; ≤ 6 mới vào được hoạt động Xếp chữ cái |
| `vi` | ✔ | nghĩa tiếng Việt, viết thường |
| `emoji` | ✔* | hoặc `image` — phải khác mọi emoji khác trong cùng chủ đề |
| `image` | | đường dẫn ảnh, được ưu tiên hơn `emoji` |
| `audio` | | file mp3, được ưu tiên hơn giọng máy |
| `sentence` | | câu mẫu, viết hoa đầu câu, có dấu chấm |

### Hoạt động (`src/activities/<id>.js`)

```js
export default {
  id: 'listen-pick',        // kebab-case, ổn định, là khóa thống kê lượt chơi
  vi: 'Nghe và chọn',       // tên cho bé
  desc: 'Nghe từ rồi chọn đúng tranh',
  icon: '👂',
  minWords: 3,              // chủ đề ít từ hơn sẽ không hiện hoạt động này
  standalone: false,        // true = không thuộc chủ đề nào (như Xưởng kể chuyện)
  mount({ topic, back }) {  // tự vẽ bằng ui.paint(); trả về hàm cleanup nếu có timer
    return () => {};
  }
};
```

### Tiến trình học (`localStorage`, khóa `bhta:progress`)

```js
{
  v: 1,
  stars: 0,
  words:  { 'animals.cat': { seen, ok, no, box /*0..4*/, lastAt } },
  topics: { animals: { plays: {flashcards: 3}, best: {} } },
  stories: [ { id, createdAt, lines, bg, stickers } ],
  settings: { rate, sfx, showVietnamese }
}
```

`box` là hộp Leitner: trả lời đúng +1, sai −1. `content.pickWords()` ưu tiên hộp thấp và
từ lâu chưa gặp — đây là **quy luật ôn tập chung**, hoạt động không được tự random từ.

## Quy tắc phát triển

1. **Nội dung không nằm trong mã.** Từ vựng chỉ ở `content/topics/`. Không hardcode từ trong activity.
2. **Chỉ `storage.js` được đụng vào `localStorage`.** Mọi nơi khác import hàm từ đó.
3. **Chỉ `content.js` được chọn từ.** Dùng `pickWords()` / `pickQuestion()`, không `Math.random()` trên `topic.words`.
4. **Không dependency runtime, không build step, không framework.** Vanilla ES module. Thứ duy nhất được cài là công cụ dev (hiện có `jsdom` cho `npm run smoke`).
5. **Màu và khoảng cách chỉ lấy từ `tokens.css`.** Không hardcode hex trong file khác.
6. **Không có trạng thái thua.** Không đếm ngược, không "Sai rồi", không màn hình game over. Chọn sai chỉ rung nhẹ + âm trầm rồi cho thử lại.
7. **Vùng chạm ≥ `--touch` (56px).**
8. **Giao diện tiếng Việt, nội dung học tiếng Anh.** Bé chưa đọc thạo nên mọi mục phải có emoji/icon đi kèm chữ.
9. **Mọi thứ phải chịu được lỗi.** Không TTS, không `localStorage`, không `AudioContext` → app vẫn chạy, chỉ mất tính năng đó.
10. **`activity.mount()` trả về hàm cleanup** nếu có `setTimeout`/listener ngoài `#app`, router sẽ gọi khi đổi màn.
11. **Chạy `npm run check` và `npm run smoke` trước khi commit.**

## Việc thường làm

| Việc | Xem skill |
|---|---|
| Thêm chủ đề / từ vựng mới | `.claude/skills/add-topic` |
| Thêm dạng bài tập mới | `.claude/skills/add-activity` |
| Chuẩn nội dung cho lứa 5–7 tuổi | `.claude/skills/content-guidelines` |
| Đổi cấu trúc dữ liệu tiến trình | `.claude/skills/extend-progress` |

## Bẫy đã biết

- Đổi `topic.id` hoặc `word.id` = mất toàn bộ tiến trình của từ đó. Coi id như khóa chính.
- Emoji trùng nhau trong một chủ đề làm hoạt động Nghe và chọn không thể trả lời đúng.
- Emoji ghép nhiều codepoint (👨‍👩‍👧‍👦, 🏳️‍🌈) hiển thị khác nhau giữa Android và iOS — ưu tiên emoji đơn.
- `speechSynthesis.getVoices()` trả mảng rỗng ở lần gọi đầu; `audio.js` đã xử lý qua `onvoiceschanged`.
- Giọng `en-US` không có sẵn trên một số máy Android; TTS sẽ im lặng. Muốn chắc chắn thì thu file mp3 và dùng trường `audio`.
- Chế độ ẩn danh chặn `localStorage`; `storage.js` tự chuyển sang bộ nhớ tạm và `isPersistent()` trả `false`.
