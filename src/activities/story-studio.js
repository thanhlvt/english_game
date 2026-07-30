/**
 * Xưởng kể chuyện - hoạt động SÁNG TẠO, không có đúng/sai.
 * Bé dán hình vào tranh, ghép câu từ 3 nhóm thẻ, nghe máy đọc và lưu truyện.
 * Khác các activity khác: không gắn với 1 chủ đề, dùng từ của toàn app.
 */
import { paint, topBar, on, $, confetti, refreshStars } from '../core/ui.js';
import { say, sayWord, sfx } from '../core/audio.js';
import { addStars, saveStory, listStories, deleteStory } from '../core/storage.js';
import { allTopics, allWords } from '../core/content.js';

/* Khung câu. Muốn thêm mẫu câu mới thì sửa 3 mảng này. */
const VERBS = [
  { t: 'is happy', e: '😊' }, { t: 'is sad', e: '😢' }, { t: 'is big', e: '🐘' },
  { t: 'is small', e: '🐭' }, { t: 'is funny', e: '🤪' }, { t: 'can jump', e: '🦘' },
  { t: 'can fly', e: '🕊️' }, { t: 'can run', e: '🏃' }, { t: 'can swim', e: '🏊' },
  { t: 'can sing', e: '🎵' }
];
const PLACES = [
  { t: '', e: '—' }, { t: 'in the house', e: '🏠' }, { t: 'on the tree', e: '🌳' },
  { t: 'in the water', e: '💧' }, { t: 'under the sun', e: '☀️' },
  { t: 'with mother', e: '👩' }, { t: 'at night', e: '🌙' }
];
const BACKGROUNDS = [
  { id: 'park', label: '🌳 Công viên' },
  { id: 'sea', label: '🌊 Biển' },
  { id: 'night', label: '🌙 Đêm' }
];

/* Chủ ngữ lấy từ chủ đề con vật + gia đình */
const subjects = () => allTopics()
  .filter(t => ['animals', 'family'].includes(t.id))
  .flatMap(t => t.words);

export default {
  id: 'story-studio',
  vi: 'Xưởng kể chuyện',
  desc: 'Dán hình, ghép câu, nghe máy đọc truyện của bé',
  icon: '🎨',
  standalone: true,          // không hiện trong menu của từng chủ đề
  minWords: 0,

  mount({ back }) {
    const SUBJ = subjects();
    const stickerPool = allWords();
    const st = { bg: 'park', stickers: [], subj: 0, verb: 0, place: 0, lines: [] };

    const sentence = () => {
      const s = SUBJ[st.subj], v = VERBS[st.verb], p = PLACES[st.place];
      return `The ${s.en} ${v.t}${p.t ? ' ' + p.t : ''}.`;
    };

    function draw() {
      const saved = listStories();
      paint(topBar('🎨 Xưởng kể chuyện', back) + `
        <div class="row wide" style="margin-bottom:var(--sp-3)">
          ${BACKGROUNDS.map(b => `<button class="btn small" data-bg="${b.id}">${b.label}</button>`).join('')}
        </div>
        <div class="scene ${st.bg}" id="scene"></div>

        <div class="lbl-sm">Dán hình vào tranh</div>
        <div class="tray">
          ${stickerPool.map((w, i) => `<button data-w="${i}" title="${w.en}" aria-label="${w.en}">${w.emoji}</button>`).join('')}
        </div>
        <div class="row wide" style="margin-top:var(--sp-2)">
          <button class="btn small" data-undo>↩︎ Bỏ hình cuối</button>
          <button class="btn small" data-clear>🧹 Xóa hết hình</button>
        </div>

        <div class="lbl-sm">Ghép câu của bé</div>
        <div class="chips">${SUBJ.map((w, i) =>
          `<button class="chip ${i === st.subj ? 'on' : ''}" data-subj="${i}">${w.emoji} ${w.en}</button>`).join('')}</div>
        <div class="chips" style="margin-top:8px">${VERBS.map((v, i) =>
          `<button class="chip ${i === st.verb ? 'on' : ''}" data-verb="${i}">${v.e} ${v.t}</button>`).join('')}</div>
        <div class="chips" style="margin-top:8px">${PLACES.map((p, i) =>
          `<button class="chip ${i === st.place ? 'on' : ''}" data-place="${i}">${p.e} ${p.t || '(không)'}</button>`).join('')}</div>

        <div class="cut sentence" style="margin-top:var(--sp-3)">${sentence()}</div>
        <div class="row wide" style="margin-top:var(--sp-2)">
          <button class="btn speak" data-read>🔊 Đọc câu</button>
          <button class="btn" data-add>＋ Thêm vào truyện</button>
        </div>

        ${st.lines.length ? `
          <div class="lbl-sm">Truyện đang viết (${st.lines.length} câu)</div>
          <div class="storylist">${st.lines.map((l, i) =>
            `<div class="storyline"><span>${i + 1}.</span> ${l}</div>`).join('')}</div>
          <div class="row wide" style="margin-top:var(--sp-2)">
            <button class="btn speak" data-readall>📖 Đọc cả truyện</button>
            <button class="btn small" data-keep>💾 Cất vào tủ truyện</button>
          </div>` : `<p class="hint">Bé hãy ghép câu rồi bấm “Thêm vào truyện”.</p>`}

        ${saved.length ? `
          <div class="lbl-sm">Tủ truyện của bé (${saved.length})</div>
          <div class="storylist">${saved.map(s =>
            `<div class="storyline">
               <span>📕</span>
               <span style="flex:1">${s.lines.length} câu · ${new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
               <button class="btn small" data-open="${s.id}">Đọc</button>
               <button class="btn small" data-del="${s.id}">🗑</button>
             </div>`).join('')}</div>` : ''}
        <div style="height:20px"></div>`);

      const scene = $('#scene');
      st.stickers.forEach(s => scene.appendChild(makeSticker(s)));

      on('[data-bg]', el => { st.bg = el.dataset.bg; draw(); });
      on('[data-w]', el => {
        const w = stickerPool[Number(el.dataset.w)];
        st.stickers.push({ emoji: w.emoji, en: w.en, x: 20 + Math.random() * 60, y: 25 + Math.random() * 55 });
        sayWord(w); draw();
      });
      on('[data-undo]', () => { st.stickers.pop(); draw(); });
      on('[data-clear]', () => { st.stickers = []; draw(); });
      on('[data-subj]', el => { st.subj = Number(el.dataset.subj); draw(); });
      on('[data-verb]', el => { st.verb = Number(el.dataset.verb); draw(); });
      on('[data-place]', el => { st.place = Number(el.dataset.place); draw(); });
      on('[data-read]', () => say(sentence(), 0.7));
      on('[data-add]', () => {
        st.lines.push(sentence());
        sfx.ok(); addStars(1); refreshStars(); confetti(); draw();
      });
      on('[data-readall]', () => say(st.lines.join(' '), 0.68));
      on('[data-keep]', () => {
        saveStory({ lines: st.lines.slice(), bg: st.bg, stickers: st.stickers.slice() });
        st.lines = []; sfx.win(); confetti(); draw();
      });
      on('[data-open]', el => {
        const s = listStories().find(x => x.id === el.dataset.open);
        if (s) say(s.lines.join(' '), 0.68);
      });
      on('[data-del]', el => { deleteStory(el.dataset.del); draw(); });
    }

    function makeSticker(s) {
      const el = document.createElement('div');
      el.className = 'sticker';
      el.textContent = s.emoji;
      el.style.left = s.x + '%';
      el.style.top = s.y + '%';
      let moved = false;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        moved = false;
        el.setPointerCapture(e.pointerId);
        el.classList.add('drag');
        const box = el.parentElement.getBoundingClientRect();
        const move = ev => {
          moved = true;
          s.x = Math.max(4, Math.min(96, (ev.clientX - box.left) / box.width * 100));
          s.y = Math.max(6, Math.min(94, (ev.clientY - box.top) / box.height * 100));
          el.style.left = s.x + '%';
          el.style.top = s.y + '%';
        };
        const up = () => {
          el.classList.remove('drag');
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          if (!moved) say(s.en);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
      });
      return el;
    }

    draw();
  }
};
