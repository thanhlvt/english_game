/**
 * Phát âm tiếng Anh (Web Speech API) + hiệu ứng âm thanh (Web Audio API).
 * Nếu từ vựng có trường `audio` (file mp3) thì ưu tiên file, không dùng TTS.
 */
import { getSettings } from './storage.js';

let voices = [];
const hasTTS = typeof speechSynthesis !== 'undefined';
function loadVoices() { voices = hasTTS ? speechSynthesis.getVoices() : []; }
if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

export function pickVoice() {
  return voices.find(v => /^en/i.test(v.lang) && /female|samantha|karen|zira|google us/i.test(v.name))
      || voices.find(v => /^en-US/i.test(v.lang))
      || voices.find(v => /^en/i.test(v.lang))
      || null;
}

/** Đọc một chuỗi tiếng Anh. rate mặc định lấy từ cài đặt (chậm cho bé). */
export function say(text, rate) {
  if (!hasTTS || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate || getSettings().rate || 0.75;
  u.pitch = 1.15;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/** Đọc một từ vựng theo schema: ưu tiên file audio, fallback TTS. */
export function sayWord(word, rate) {
  if (word && word.audio) {
    const a = new Audio(word.audio);
    a.play().catch(() => say(word.en, rate));
    return;
  }
  say(word ? word.en : '', rate);
}

/* ---------- hiệu ứng âm thanh ---------- */
let ctx;
function tone(freqs, dur = 0.18) {
  if (!getSettings().sfx) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    });
  } catch (e) { /* thiết bị không hỗ trợ -> im lặng */ }
}

export const sfx = {
  ok:   () => tone([784, 1047], 0.16),
  no:   () => tone([320, 240], 0.18),   // trầm, nhẹ - KHÔNG dùng tiếng "sai" chói
  step: (n = 0) => tone([600 + n * 80], 0.1),
  win:  () => tone([659, 784, 988, 1319], 0.16)
};

export function stopAll() {
  if (hasTTS) speechSynthesis.cancel();
}
