/** Góc bố mẹ: xem tiến trình, chỉnh cài đặt, xóa dữ liệu. Không dành cho bé. */
import { paint, topBar, on } from '../core/ui.js';
import { allTopics } from '../core/content.js';
import {
  load, getStars, getWord, getSettings, setSetting, resetAll, listStories, isPersistent
} from '../core/storage.js';

const BOX_LABEL = ['chưa học', 'mới biết', 'đang nhớ', 'khá thuộc', 'thuộc rồi'];

export default function parent() {
  const p = load();
  const topics = allTopics();
  const all = topics.flatMap(t => t.words.map(w => ({ ...w, topicId: t.id, s: getWord(t.id, w.id) })));
  const learned = all.filter(x => x.s.box >= 2).length;
  const weak = all.filter(x => x.s.seen > 0 && x.s.box <= 1)
                  .sort((a, b) => (b.s.no - b.s.ok) - (a.s.no - a.s.ok)).slice(0, 10);
  const st = getSettings();

  paint(topBar('👪 Góc bố mẹ', '/') + `
    <div class="stat-grid">
      <div class="cut stat"><b>${getStars()}</b><span>sao đã nhận</span></div>
      <div class="cut stat"><b>${learned}/${all.length}</b><span>từ đã thuộc</span></div>
      <div class="cut stat"><b>${Object.keys(p.words).length}</b><span>từ đã gặp</span></div>
      <div class="cut stat"><b>${listStories().length}</b><span>truyện đã viết</span></div>
    </div>

    ${weak.length ? `<div class="lbl-sm">Từ cần ôn thêm</div>
      <div class="storylist">
        ${weak.map(w => `<div class="wordrow">
          <span style="font-size:22px">${w.emoji}</span>
          <span>${w.en} <i style="opacity:.5;font-weight:700">— ${w.vi}</i></span>
          <span class="box">${BOX_LABEL[w.s.box]}</span>
        </div>`).join('')}
      </div>` : '<p class="hint">Chưa có dữ liệu luyện tập.</p>'}

    <div class="lbl-sm">Cài đặt</div>
    <div class="storylist">
      <div class="wordrow">
        <span>Tốc độ đọc</span>
        <span class="box">
          <button class="btn small" data-rate="-0.05">−</button>
          <b id="rateval">${st.rate.toFixed(2)}</b>
          <button class="btn small" data-rate="0.05">+</button>
        </span>
      </div>
      <div class="wordrow"><span>Hiện nghĩa tiếng Việt</span>
        <span class="box"><button class="btn small" data-toggle="showVietnamese">${st.showVietnamese ? 'Bật' : 'Tắt'}</button></span></div>
      <div class="wordrow"><span>Âm thanh hiệu ứng</span>
        <span class="box"><button class="btn small" data-toggle="sfx">${st.sfx ? 'Bật' : 'Tắt'}</button></span></div>
    </div>

    <div class="row wide" style="margin-top:var(--sp-4)">
      <button class="btn small" data-export>⬇︎ Tải bản sao dữ liệu</button>
      <button class="btn small" data-reset>🗑 Xóa toàn bộ tiến trình</button>
    </div>
    <p class="hint">${isPersistent()
      ? 'Dữ liệu lưu trong trình duyệt của thiết bị này, không gửi đi đâu cả.'
      : 'Trình duyệt đang chặn lưu trữ, tiến trình sẽ mất khi đóng tab.'}</p>`);

  on('[data-rate]', el => {
    const v = Math.min(1.2, Math.max(0.4, st.rate + Number(el.dataset.rate)));
    setSetting('rate', Number(v.toFixed(2)));
    parent();
  });
  on('[data-toggle]', el => { setSetting(el.dataset.toggle, !st[el.dataset.toggle]); parent(); });
  on('[data-reset]', () => {
    if (confirm('Xóa toàn bộ sao, tiến trình và truyện của bé?')) { resetAll(); parent(); }
  });
  on('[data-export]', () => {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tien-trinh-hoc.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
