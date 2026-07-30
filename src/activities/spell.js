import { paint, topBar, on, $, confetti, shuffle, refreshStars } from '../core/ui.js';
import { sayWord, sfx } from '../core/audio.js';
import { recordAnswer, addStars, recordPlay } from '../core/storage.js';
import { pickWords } from '../core/content.js';

const MAX_LEN = 6; // dài hơn 6 chữ cái là quá sức trẻ 5-7 tuổi

export default {
  id: 'spell',
  vi: 'Xếp chữ cái',
  desc: 'Xếp các chữ thành từ đúng',
  icon: '🔤',
  minWords: 1,

  mount({ topic, back }) {
    const self = this;
    const pool = topic.words.filter(w => w.en.length <= MAX_LEN);
    if (!pool.length) {
      paint(topBar(self.icon + ' ' + self.vi, back) +
        `<p class="hint">Chủ đề này chưa có từ đủ ngắn để xếp chữ.</p>`);
      return;
    }
    recordPlay(topic.id, self.id);
    let word, filled, tiles;

    function reset() {
      const candidates = pickWords(topic, topic.words.length).filter(w => w.en.length <= MAX_LEN);
      word = candidates[0] || pool[0];
      filled = [];
      tiles = shuffle(word.en.split('').map(ch => ({ ch })));
    }

    function draw() {
      const done = filled.length === word.en.length;
      paint(topBar(self.icon + ' ' + self.vi, back) + `
        <div class="stage">
          <div class="cut card" id="card" style="padding:var(--sp-4)">
            <div class="emo" style="font-size:min(22vw,110px)">${word.emoji}</div>
            <div class="vi">${word.vi}</div>
          </div>
          <div class="slots">
            ${word.en.split('').map((_, k) =>
              `<div class="slot ${filled[k] ? 'filled' : ''}">${filled[k] || ''}</div>`).join('')}
          </div>
          ${done
            ? `<button class="btn speak" data-next style="max-width:340px">🎉 Từ tiếp theo ›</button>`
            : `<div class="tiles">${tiles.map((t, k) =>
                `<button class="tile-l ${t.used ? 'used' : ''}" data-i="${k}">${t.ch}</button>`).join('')}</div>`}
        </div>
        <p class="hint">Chạm vào tranh để nghe từ.</p>`);

      $('#card').addEventListener('click', () => sayWord(word));
      if (done) { on('[data-next]', () => { reset(); draw(); }); return; }

      on('.tile-l', el => {
        const t = tiles[Number(el.dataset.i)];
        const need = word.en[filled.length];
        if (t.ch === need) {
          t.used = true; filled.push(t.ch);
          sfx.step(filled.length);
          if (filled.length === word.en.length) {
            recordAnswer(topic.id, word.id, true);
            addStars(2); refreshStars(); confetti(); sfx.win(); sayWord(word);
          }
          draw();
        } else {
          recordAnswer(topic.id, word.id, false);
          el.classList.add('wrong'); sfx.no();
          setTimeout(() => el.classList.remove('wrong'), 350);
        }
      });
    }

    reset(); draw();
  }
};
