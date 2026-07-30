import { paint, topBar, on, $, refreshStars } from '../core/ui.js';
import { sayWord } from '../core/audio.js';
import { recordAnswer, recordPlay, getSettings } from '../core/storage.js';
import { pickWords } from '../core/content.js';

export default {
  id: 'flashcards',
  vi: 'Học từ mới',
  desc: 'Xem tranh, nghe và nhắc lại',
  icon: '👀',
  minWords: 1,

  mount({ topic, back }) {
    const self = this;
    const words = pickWords(topic, topic.words.length);
    let i = 0;
    recordPlay(topic.id, self.id);

    function draw() {
      const w = words[i];
      const showVi = getSettings().showVietnamese;
      paint(topBar(self.icon + ' ' + self.vi, back) + `
        <div class="stage">
          <div class="cut card" id="card">
            <div class="emo">${w.emoji}</div>
            <div class="en">${w.en}</div>
            ${showVi ? `<div class="vi">${w.vi}</div>` : ''}
          </div>
          <div class="row">
            <button class="btn small" data-nav="-1" aria-label="Từ trước">‹</button>
            <button class="btn speak" data-say>🔊 Nghe</button>
            <button class="btn small" data-nav="1" aria-label="Từ sau">›</button>
          </div>
          <div class="dots">${words.map((_, k) => `<span class="dot ${k === i ? 'on' : ''}"></span>`).join('')}</div>
        </div>
        <p class="hint">Chạm vào tranh để nghe lại. Bé hãy nhắc theo nhé!</p>`);

      sayWord(w);
      recordAnswer(topic.id, w.id, null);
      refreshStars();

      $('#card').addEventListener('click', () => sayWord(w));
      on('[data-say]', () => sayWord(w));
      on('[data-nav]', el => {
        i = (i + Number(el.dataset.nav) + words.length) % words.length;
        draw();
      });
    }

    draw();
  }
};
