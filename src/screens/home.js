import { paint, topBar, on } from '../core/ui.js';
import { allTopics } from '../core/content.js';
import { topicMastery, isPersistent } from '../core/storage.js';
import { navigate } from '../core/router.js';

export default function home() {
  const topics = allTopics();
  paint(topBar('Bé Học Tiếng Anh') + `
    <button class="cut hero" data-story>
      <div class="big">🎨</div>
      <div>
        <div class="disp" style="font-size:22px">Xưởng kể chuyện</div>
        <span class="p">Dán hình, ghép câu, nghe máy đọc truyện của bé</span>
      </div>
      <div class="go">›</div>
    </button>

    <div class="lbl-sm">Chọn chủ đề</div>
    <div class="grid">
      ${topics.map(t => {
        const pct = topicMastery(t.id, t.words);
        return `<button class="cut tile" data-topic="${t.id}">
          <div class="emo">${t.icon}</div>
          <div class="name">${t.vi}</div>
          <div class="sub">${t.words.length} từ · thuộc ${pct}%</div>
          <div class="meter"><i style="width:${pct}%"></i></div>
        </button>`;
      }).join('')}
    </div>

    <div class="row wide" style="margin-top:var(--sp-4)">
      <button class="btn small" data-parent>👪 Góc bố mẹ</button>
    </div>
    <p class="hint">Bật loa để bé nghe phát âm.${isPersistent() ? '' : '<br>Trình duyệt đang chặn lưu trữ nên tiến trình sẽ không được giữ lại.'}</p>`);

  on('[data-topic]', el => navigate('/topic/' + el.dataset.topic));
  on('[data-story]', () => navigate('/story'));
  on('[data-parent]', () => navigate('/parent'));
}
