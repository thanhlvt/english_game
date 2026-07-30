/**
 * Sổ đăng ký nội dung. Đọc từ /content, kiểm tra sơ bộ và cung cấp
 * hàm chọn từ theo mức độ thành thạo (Leitner).
 */
import { TOPICS } from '../../content/index.js';
import { getWord } from './storage.js';
import { shuffle } from './ui.js';

const byId = new Map(TOPICS.map(t => [t.id, t]));

export const allTopics = () => TOPICS;
export const getTopic = id => byId.get(id) || null;
export const allWords = () => TOPICS.flatMap(t => t.words.map(w => ({ ...w, topicId: t.id })));

/**
 * Chọn n từ để luyện: ưu tiên từ chưa thuộc (box thấp) và lâu chưa gặp.
 * Đây là "quy luật ôn tập" chung cho mọi hoạt động - đừng tự random trong activity.
 */
export function pickWords(topic, n) {
  const scored = topic.words.map(w => {
    const s = getWord(topic.id, w.id);
    const age = s.lastAt ? (Date.now() - s.lastAt) / 86400000 : 999; // số ngày
    return { w, score: s.box * 10 - Math.min(age, 30) + Math.random() * 3 };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, Math.min(n, topic.words.length)).map(x => x.w);
}

/** Lấy 1 từ để hỏi + (k) từ nhiễu cùng chủ đề. */
export function pickQuestion(topic, distractors = 2) {
  const [answer] = pickWords(topic, 1);
  const others = shuffle(topic.words.filter(w => w.id !== answer.id)).slice(0, distractors);
  return { answer, options: shuffle([answer, ...others]) };
}

/** Kiểm tra dữ liệu lúc chạy - chỉ cảnh báo trong console, không làm vỡ app. */
export function validate() {
  const errs = [];
  const seen = new Set();
  for (const t of TOPICS) {
    if (!t.id || !t.vi || !t.icon || !Array.isArray(t.words)) errs.push(`Chủ đề hỏng: ${t.id}`);
    if (seen.has(t.id)) errs.push(`Trùng id chủ đề: ${t.id}`);
    seen.add(t.id);
    const wIds = new Set();
    for (const w of t.words) {
      if (!w.id || !w.en || !w.vi || !(w.emoji || w.image)) errs.push(`Từ hỏng trong ${t.id}: ${w.id || w.en}`);
      if (wIds.has(w.id)) errs.push(`Trùng id từ trong ${t.id}: ${w.id}`);
      wIds.add(w.id);
    }
    if (t.words.length < 4) errs.push(`${t.id} cần ít nhất 4 từ`);
  }
  if (errs.length) console.warn('[content]', errs);
  return errs;
}
