import { paint, topBar, on, confetti, refreshStars } from '../core/ui.js';
import { sayWord } from '../core/audio.js';
import { sfx } from '../core/audio.js';
import { recordAnswer, addStars, recordPlay } from '../core/storage.js';
import { pickQuestion } from '../core/content.js';

export default {
  id: 'listen-pick',
  vi: 'Nghe và chọn',
  desc: 'Nghe từ rồi chọn đúng tranh',
  icon: '👂',
  minWords: 3,

  mount({ topic, back }) {
    let timers = [];
    recordPlay(topic.id, this.id);
    const self = this;

    function draw() {
      const q = pickQuestion(topic, 2);
      let locked = false;

      paint(topBar(self.icon + ' ' + self.vi, back) + `
        <div class="stage">
          <div class="cut prompt">Con nghe thấy từ nào?</div>
          <button class="btn speak" data-say style="max-width:400px">🔊 Nghe lại</button>
          <div class="opts">
            ${q.options.map((w, i) => `<button class="cut opt" data-i="${i}">${w.emoji}</button>`).join('')}
          </div>
        </div>
        <p class="hint">Chọn sai cũng không sao, thử lại nào!</p>`);

      timers.push(setTimeout(() => sayWord(q.answer), 350));
      on('[data-say]', () => sayWord(q.answer));
      on('.opt', el => {
        if (locked) return;
        const w = q.options[Number(el.dataset.i)];
        const correct = w.id === q.answer.id;
        recordAnswer(topic.id, q.answer.id, correct);
        if (correct) {
          locked = true;
          el.classList.add('right');
          el.innerHTML = w.emoji + `<div class="lbl">${w.en}</div>`;
          sfx.ok(); addStars(1); refreshStars(); confetti(); sayWord(w);
          timers.push(setTimeout(draw, 1600));
        } else {
          el.classList.add('wrong'); sfx.no();
          timers.push(setTimeout(() => el.classList.remove('wrong'), 400));
        }
      });
    }

    draw();
    return () => timers.forEach(clearTimeout);
  }
};
