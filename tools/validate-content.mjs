/**
 * Kiểm tra dữ liệu bài học trước khi commit:  npm run check
 * Không cần cài gì thêm. Thoát mã 1 nếu có LỖI (cảnh báo thì vẫn thoát 0).
 */
import { TOPICS } from '../content/index.js';

const errors = [];
const warns = [];
const EN_OK = /^[a-z]+(?:[ -][a-z]+)*$/;

const topicIds = new Set();
const enGlobal = new Map();

for (const t of TOPICS) {
  const at = `[${t.id || '???'}]`;
  for (const f of ['id', 'vi', 'en', 'icon']) {
    if (!t[f]) errors.push(`${at} thiếu trường "${f}"`);
  }
  if (t.id && !/^[a-z][a-z0-9-]*$/.test(t.id)) errors.push(`${at} id phải là kebab-case`);
  if (topicIds.has(t.id)) errors.push(`${at} id chủ đề bị trùng`);
  topicIds.add(t.id);
  if (!Array.isArray(t.words) || t.words.length < 4) {
    errors.push(`${at} phải có ít nhất 4 từ`);
    continue;
  }

  const wordIds = new Set();
  const emojis = new Map();
  for (const w of t.words) {
    const at2 = `${at} "${w.id || w.en || '???'}"`;
    for (const f of ['id', 'en', 'vi']) {
      if (!w[f]) errors.push(`${at2} thiếu trường "${f}"`);
    }
    if (!w.emoji && !w.image) errors.push(`${at2} phải có "emoji" hoặc "image"`);
    if (w.id && !/^[a-z][a-z0-9-]*$/.test(w.id)) errors.push(`${at2} id phải là kebab-case`);
    if (wordIds.has(w.id)) errors.push(`${at2} id từ bị trùng trong chủ đề`);
    wordIds.add(w.id);
    if (w.en && !EN_OK.test(w.en)) errors.push(`${at2} "en" chỉ dùng chữ thường a-z, dấu cách hoặc gạch nối`);
    if (w.sentence && !/^[A-Z].*[.!?]$/.test(w.sentence)) {
      errors.push(`${at2} "sentence" phải viết hoa đầu câu và có dấu kết thúc`);
    }

    if (w.emoji) {
      if (emojis.has(w.emoji)) warns.push(`${at2} dùng emoji trùng với "${emojis.get(w.emoji)}" — bé sẽ khó phân biệt khi chơi Nghe và chọn`);
      emojis.set(w.emoji, w.id);
    }
    if (w.en) {
      if (enGlobal.has(w.en) && enGlobal.get(w.en) !== t.id) {
        warns.push(`${at2} từ "${w.en}" đã có trong chủ đề "${enGlobal.get(w.en)}"`);
      }
      enGlobal.set(w.en, t.id);
      if (w.en.length > 6) warns.push(`${at2} dài ${w.en.length} chữ cái nên sẽ bị bỏ qua ở hoạt động Xếp chữ cái`);
      if (w.en.length > 9) errors.push(`${at2} quá dài cho trẻ 5-7 tuổi (tối đa 9 chữ cái)`);
    }
  }
  if (t.words.length < 6) warns.push(`${at} chỉ có ${t.words.length} từ — hoạt động Lật hình tìm cặp cần 6 từ`);
}

const totalWords = TOPICS.reduce((n, t) => n + t.words.length, 0);
console.log(`Đã kiểm tra ${TOPICS.length} chủ đề, ${totalWords} từ.`);
warns.forEach(w => console.log('  ⚠  ' + w));
errors.forEach(e => console.log('  ✗  ' + e));
if (errors.length) {
  console.log(`\n${errors.length} lỗi cần sửa.`);
  process.exit(1);
}
console.log(warns.length ? `\n${warns.length} cảnh báo, không chặn.` : '\nTất cả hợp lệ.');
