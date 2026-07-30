/**
 * Router theo hash: #/topic/animals, #/play/animals/flashcards ...
 * Mỗi handler có thể trả về hàm dọn dẹp (cleanup), router sẽ gọi trước khi đổi màn.
 */
import { stopAll } from './audio.js';

const routes = [];
let cleanup = null;

/** pattern dạng '/play/:topicId/:activityId' */
export function route(pattern, handler) {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:([A-Za-z]+)/g, (_, k) => {
    keys.push(k); return '([^/]+)';
  }) + '$');
  routes.push({ rx, keys, handler });
}

export const navigate = path => { location.hash = '#' + path; };

export function current() {
  const h = location.hash.replace(/^#/, '');
  return h || '/';
}

function resolve() {
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) {} }
  cleanup = null;
  stopAll();
  const path = current();
  for (const r of routes) {
    const m = path.match(r.rx);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
      cleanup = r.handler(params) || null;
      return;
    }
  }
  navigate('/');
}

export function start() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
