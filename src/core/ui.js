/**
 * Hàm dựng giao diện dùng chung. Không chứa logic bài học.
 */
import { getStars } from './storage.js';

export const app = () => document.getElementById('app');

/** Render HTML vào #app và trả về chính phần tử đó. */
export function paint(html) {
  const root = app();
  root.innerHTML = html;
  root.scrollTop = 0;
  try { window.scrollTo(0, 0); } catch (e) { /* môi trường test */ }
  return root;
}

export const $  = (sel, root = app()) => root.querySelector(sel);
export const $$ = (sel, root = app()) => Array.from(root.querySelectorAll(sel));

/** Gắn onclick cho nhiều phần tử theo selector. */
export function on(sel, handler, root = app()) {
  $$(sel, root).forEach(el => el.addEventListener('click', ev => handler(el, ev)));
}

/** Thanh trên cùng: nút quay lại + tiêu đề + số sao. */
export function topBar(title, backHref) {
  return `<div class="bar">
    ${backHref ? `<a class="icon-btn" href="#${backHref}" aria-label="Quay lại">←</a>` : ''}
    <h1>${title}</h1>
    <div class="stars" aria-label="Số sao">⭐ <span id="starnum">${getStars()}</span></div>
  </div>`;
}

/** Cập nhật số sao trên thanh mà không render lại cả màn hình. */
export function refreshStars() {
  const el = document.getElementById('starnum');
  if (el) el.textContent = getStars();
}

export function confetti(n = 26) {
  const box = document.getElementById('fx');
  const emo = ['⭐', '🎉', '💛', '🌈', '✨', '🎈'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'piece';
    s.textContent = emo[Math.floor(Math.random() * emo.length)];
    s.style.left = Math.random() * 100 + '%';
    s.style.top = '-40px';
    s.style.animationDelay = (Math.random() * 0.5) + 's';
    box.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}

/** Màn hình kết thúc một lượt chơi. */
export function doneBox({ emoji = '🏆', title = 'Giỏi quá!', note = '', again = 'Chơi lại' }) {
  return `<div class="cut done-box">
    <div class="e">${emoji}</div><h2>${title}</h2>
    ${note ? `<div style="font-size:15px;opacity:.6">${note}</div>` : ''}
    <button class="btn" data-again style="max-width:260px">${again}</button>
  </div>`;
}

/* tiện ích chung */
export const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
export const rnd = a => a[Math.floor(Math.random() * a.length)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
