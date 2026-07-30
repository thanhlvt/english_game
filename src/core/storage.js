/**
 * Lưu tiến trình học vào localStorage.
 * QUY TẮC: mọi thao tác đọc/ghi localStorage phải đi qua file này.
 * Không module nào khác được gọi localStorage trực tiếp.
 */
const KEY = 'bhta:progress';
const VERSION = 1;

const EMPTY = () => ({
  v: VERSION,
  createdAt: Date.now(),
  stars: 0,
  /** 'topicId.wordId' -> { seen, ok, no, box, lastAt } */
  words: {},
  /** topicId -> { plays: {activityId: count}, best: {activityId: number} } */
  topics: {},
  /** truyện bé tự tạo trong Xưởng kể chuyện */
  stories: [],
  settings: { rate: 0.75, sfx: true, showVietnamese: true }
});

let cache = null;
let failed = false; // true khi trình duyệt chặn localStorage (chế độ riêng tư)

/** Nâng cấp dữ liệu cũ khi đổi VERSION. Thêm nhánh mới ở đây, không xóa dữ liệu cũ. */
function migrate(data) {
  if (!data || typeof data !== 'object') return EMPTY();
  if (data.v === VERSION) return { ...EMPTY(), ...data };
  // ví dụ khi lên v2:
  // if (data.v === 1) { data.newField = []; data.v = 2; }
  return { ...EMPTY(), ...data, v: VERSION };
}

export function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = migrate(raw ? JSON.parse(raw) : null);
  } catch (e) {
    failed = true;
    cache = EMPTY();
  }
  return cache;
}

export function save() {
  if (failed || !cache) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
    return true;
  } catch (e) {
    failed = true; // hết quota hoặc bị chặn -> app vẫn chạy, chỉ mất lưu
    return false;
  }
}

export const isPersistent = () => !failed;

/* ---------- sao thưởng ---------- */
export function addStars(n = 1) {
  const p = load();
  p.stars += n;
  save();
  return p.stars;
}
export const getStars = () => load().stars;

/* ---------- thống kê từ vựng (hộp Leitner 0..4) ---------- */
export function wordKey(topicId, wordId) {
  return topicId + '.' + wordId;
}

export function getWord(topicId, wordId) {
  const p = load();
  return p.words[wordKey(topicId, wordId)] || { seen: 0, ok: 0, no: 0, box: 0, lastAt: 0 };
}

/** Ghi lại một lần trả lời. correct=null nghĩa là chỉ xem (flashcard). */
export function recordAnswer(topicId, wordId, correct) {
  const p = load();
  const k = wordKey(topicId, wordId);
  const w = p.words[k] || { seen: 0, ok: 0, no: 0, box: 0, lastAt: 0 };
  w.seen++;
  w.lastAt = Date.now();
  if (correct === true) { w.ok++; w.box = Math.min(4, w.box + 1); }
  if (correct === false) { w.no++; w.box = Math.max(0, w.box - 1); }
  p.words[k] = w;
  save();
  return w;
}

/** % số từ của chủ đề đã lên hộp >= 2 */
export function topicMastery(topicId, words) {
  if (!words.length) return 0;
  const learned = words.filter(w => getWord(topicId, w.id).box >= 2).length;
  return Math.round(learned / words.length * 100);
}

/* ---------- lượt chơi từng hoạt động ---------- */
export function recordPlay(topicId, activityId, score) {
  const p = load();
  const t = p.topics[topicId] || { plays: {}, best: {} };
  t.plays[activityId] = (t.plays[activityId] || 0) + 1;
  if (typeof score === 'number') {
    t.best[activityId] = Math.max(t.best[activityId] || 0, score);
  }
  p.topics[topicId] = t;
  save();
}
export const getTopicStats = id => load().topics[id] || { plays: {}, best: {} };

/* ---------- truyện của bé ---------- */
export function saveStory(story) {
  const p = load();
  p.stories.unshift({ id: 's' + Date.now(), createdAt: Date.now(), ...story });
  p.stories = p.stories.slice(0, 20); // giữ 20 truyện gần nhất cho nhẹ
  save();
}
export const listStories = () => load().stories;
export function deleteStory(id) {
  const p = load();
  p.stories = p.stories.filter(s => s.id !== id);
  save();
}

/* ---------- cài đặt ---------- */
export const getSettings = () => load().settings;
export function setSetting(key, value) {
  const p = load();
  p.settings[key] = value;
  save();
}

/* ---------- reset (dùng ở Góc bố mẹ) ---------- */
export function resetAll() {
  cache = EMPTY();
  try { localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ }
  save();
}
