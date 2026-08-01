/**
 * Xưởng kể chuyện - hoạt động SÁNG TẠO, không có đúng/sai.
 * Bé ghép câu từ các nhóm thẻ (chủ ngữ, trạng thái/hành động, địa điểm), nghe máy đọc và lưu truyện.
 * Khi đọc câu/truyện, tranh minh hoạ hiện đúng nội dung câu vừa ghép.
 * Khác các activity khác: không gắn với 1 chủ đề, dùng từ của toàn app.
 */
import { paint, topBar, on, $, $$, confetti, refreshStars } from '../core/ui.js';
import { say, sfx } from '../core/audio.js';
import { addStars, saveStory, listStories, deleteStory } from '../core/storage.js';
import { allTopics } from '../core/content.js';

/* Khung câu. Muốn thêm mẫu câu mới thì sửa các mảng này.
   Trạng thái và Hành động loại trừ nhau: câu chỉ có 1 trong 2, chọn bên này sẽ bỏ chọn bên kia. */
const STATES = [
  { t: 'is happy', e: '😊' }, { t: 'is sad', e: '😢' }, { t: 'is big', e: '🐘' },
  { t: 'is small', e: '🐭' }, { t: 'is funny', e: '🤪' }, { t: 'is tired', e: '😴' },
  { t: 'is hungry', e: '😋' }, { t: 'is thirsty', e: '🥤' }, { t: 'is scared', e: '😱' },
  { t: 'is cold', e: '🥶' }
];
const ACTIONS = [
  { t: 'can jump', e: '🦘' }, { t: 'can fly', e: '🕊️' }, { t: 'can run', e: '🏃' },
  { t: 'can swim', e: '🏊' }, { t: 'can sing', e: '🎵' }, { t: 'can dance', e: '💃' },
  { t: 'can climb', e: '🧗' }, { t: 'can walk', e: '🚶' }, { t: 'can eat', e: '🍎' },
  { t: 'can drink', e: '🥛' }
];
const PLACES = [
  { t: '', e: '—' }, { t: 'in the house', e: '🏠' }, { t: 'on the tree', e: '🌳' },
  { t: 'in the water', e: '💧' }, { t: 'under the sun', e: '☀️' },
  { t: 'with mother', e: '👩' }, { t: 'with father', e: '👨' }, { t: 'at night', e: '🌙' },
  { t: 'in the garden', e: '🌻' }, { t: 'at the beach', e: '🏖️' }, { t: 'in the sky', e: '☁️' },
  { t: 'at school', e: '🏫' }
];

/* Chủ ngữ lấy từ chủ đề con vật + gia đình */
const subjects = () => allTopics()
  .filter(t => ['animals', 'family'].includes(t.id))
  .flatMap(t => t.words);

/** Chuẩn hoá 1 dòng truyện (hỗ trợ cả truyện cũ chỉ có chuỗi chữ). */
const asLine = l => typeof l === 'string' ? { text: l, emojis: [] } : l;

function renderPicture(items) {
  if (!items || !items.length) {
    return `<p class="hint">Ghép câu rồi bấm "🔊 Đọc câu" để xem tranh minh hoạ nhé!</p>`;
  }
  return items.map(it => `
    <div class="scene-line">
      <div class="scene-emojis">${(it.emojis && it.emojis.length ? it.emojis : ['📖']).join(' ')}</div>
      <div class="scene-text">${it.text}</div>
    </div>`).join('');
}

export default {
  id: 'story-studio',
  vi: 'Xưởng kể chuyện',
  desc: 'Ghép câu, nghe máy đọc và xem tranh minh hoạ truyện của bé',
  icon: '🎨',
  standalone: true,          // không hiện trong menu của từng chủ đề
  minWords: 0,

  mount({ back }) {
    const SUBJ = subjects();
    const st = { subj: 0, mood: { kind: 'state', index: 0 }, place: 0, lines: [], picture: null };

    const mood = () => (st.mood.kind === 'state' ? STATES : ACTIONS)[st.mood.index];
    const current = () => ({ s: SUBJ[st.subj], v: mood(), p: PLACES[st.place] });
    const sentenceText = () => {
      const { s, v, p } = current();
      return `The ${s.en} ${v.t}${p.t ? ' ' + p.t : ''}.`;
    };
    const sentenceItem = () => {
      const { s, v, p } = current();
      const emojis = [s.emoji, v.e];
      if (p.t) emojis.push(p.e);
      return { text: sentenceText(), emojis };
    };

    /** Chỉ cập nhật DOM tại chỗ (không paint lại) để không giật trang lên đầu. */
    function updateSentenceUI() {
      $('#sentence').textContent = sentenceText();
      ['subj', 'place'].forEach(k => {
        $$(`[data-${k}]`).forEach(el => el.classList.toggle('on', Number(el.dataset[k]) === st[k]));
      });
      $$('[data-state]').forEach(el =>
        el.classList.toggle('on', st.mood.kind === 'state' && Number(el.dataset.state) === st.mood.index));
      $$('[data-action]').forEach(el =>
        el.classList.toggle('on', st.mood.kind === 'action' && Number(el.dataset.action) === st.mood.index));
    }

    function updatePicture(items) {
      st.picture = items;
      $('#scene').innerHTML = renderPicture(items);
    }

    function draw() {
      const saved = listStories();
      paint(topBar('🎨 Xưởng kể chuyện', back) + `
        <div class="scene" id="scene">${renderPicture(st.picture)}</div>

        <div class="lbl-sm">Ghép câu của bé</div>
        <div class="lbl-sm">Chủ ngữ</div>
        <div class="chips">${SUBJ.map((w, i) =>
          `<button class="chip ${i === st.subj ? 'on' : ''}" data-subj="${i}">${w.emoji} ${w.en}</button>`).join('')}</div>
        <div class="lbl-sm">Trạng thái</div>
        <div class="chips">${STATES.map((v, i) =>
          `<button class="chip ${st.mood.kind === 'state' && i === st.mood.index ? 'on' : ''}" data-state="${i}">${v.e} ${v.t}</button>`).join('')}</div>
        <div class="lbl-sm">Hành động</div>
        <div class="chips">${ACTIONS.map((v, i) =>
          `<button class="chip ${st.mood.kind === 'action' && i === st.mood.index ? 'on' : ''}" data-action="${i}">${v.e} ${v.t}</button>`).join('')}</div>
        <div class="lbl-sm">Nơi chốn</div>
        <div class="chips">${PLACES.map((p, i) =>
          `<button class="chip ${i === st.place ? 'on' : ''}" data-place="${i}">${p.e} ${p.t || '(không)'}</button>`).join('')}</div>

        <div class="cut sentence" id="sentence" style="margin-top:var(--sp-3)">${sentenceText()}</div>
        <div class="row wide" style="margin-top:var(--sp-2)">
          <button class="btn speak" data-read>🔊 Đọc câu</button>
          <button class="btn" data-add>＋ Thêm vào truyện</button>
        </div>

        ${st.lines.length ? `
          <div class="lbl-sm">Truyện đang viết (${st.lines.length} câu)</div>
          <div class="storylist">${st.lines.map((l, i) =>
            `<div class="storyline"><span>${i + 1}.</span> ${l.text}</div>`).join('')}</div>
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

      on('[data-subj]', el => { st.subj = Number(el.dataset.subj); updateSentenceUI(); });
      on('[data-state]', el => { st.mood = { kind: 'state', index: Number(el.dataset.state) }; updateSentenceUI(); });
      on('[data-action]', el => { st.mood = { kind: 'action', index: Number(el.dataset.action) }; updateSentenceUI(); });
      on('[data-place]', el => { st.place = Number(el.dataset.place); updateSentenceUI(); });
      on('[data-read]', () => {
        const item = sentenceItem();
        updatePicture([item]);
        say(item.text, 0.7);
      });
      on('[data-add]', () => {
        st.lines.push(sentenceItem());
        sfx.ok(); addStars(1); refreshStars(); confetti(); draw();
      });
      on('[data-readall]', () => {
        updatePicture(st.lines.slice());
        say(st.lines.map(l => l.text).join(' '), 0.68);
      });
      on('[data-keep]', () => {
        saveStory({ lines: st.lines.slice() });
        st.lines = []; st.picture = null; sfx.win(); confetti(); draw();
      });
      on('[data-open]', el => {
        const s = listStories().find(x => x.id === el.dataset.open);
        if (!s) return;
        const items = s.lines.map(asLine);
        updatePicture(items);
        say(items.map(l => l.text).join(' '), 0.68);
      });
      on('[data-del]', el => { deleteStory(el.dataset.del); draw(); });
    }

    draw();
  }
};
