import { paint, topBar, on, confetti, doneBox, shuffle, refreshStars } from '../core/ui.js';
import { sayWord, sfx } from '../core/audio.js';
import { recordAnswer, addStars, recordPlay } from '../core/storage.js';
import { pickWords } from '../core/content.js';

const PAIRS = 6;

export default {
  id: 'memory-match',
  vi: 'Lật hình tìm cặp',
  desc: 'Ghép tranh với chữ',
  icon: '🃏',
  minWords: PAIRS,

  mount({ topic, back }) {
    let timers = [];
    const self = this;
    let cards, open, found, lock;

    function reset() {
      const picked = pickWords(topic, PAIRS);
      cards = shuffle(picked.flatMap((w, k) => ([
        { k, kind: 'pic',  face: w.emoji, word: w },
        { k, kind: 'word', face: w.en,    word: w }
      ])));
      open = []; found = 0; lock = false;
      recordPlay(topic.id, self.id);
    }

    function draw() {
      if (found === PAIRS) {
        paint(topBar(self.icon + ' ' + self.vi, back) +
          doneBox({ note: `Bé đã ghép đúng cả ${PAIRS} cặp` }));
        on('[data-again]', () => { reset(); draw(); });
        return;
      }
      paint(topBar(self.icon + ' ' + self.vi, back) + `
        <div class="stage">
          <div class="mem">
            ${cards.map((c, i) => `
              <button class="mcard ${c.done ? 'flip done' : ''} ${open.includes(i) ? 'flip' : ''}" data-i="${i}" aria-label="Lá bài ${i + 1}">
                <div class="inner">
                  <div class="mface mback">?</div>
                  <div class="mface mfront ${c.kind === 'word' ? 'word' : ''}">${c.face}</div>
                </div>
              </button>`).join('')}
          </div>
        </div>
        <p class="hint">Tìm tranh và chữ đi cùng nhau.</p>`);

      on('.mcard', el => {
        const i = Number(el.dataset.i);
        if (lock || cards[i].done || open.includes(i)) return;
        open.push(i);
        el.classList.add('flip');
        sayWord(cards[i].word);
        if (open.length < 2) return;

        const [a, b] = open;
        const hit = cards[a].k === cards[b].k && cards[a].kind !== cards[b].kind;
        recordAnswer(topic.id, cards[a].word.id, hit);
        if (hit) {
          cards[a].done = cards[b].done = true;
          found++; open = [];
          sfx.ok(); addStars(1); refreshStars();
          if (found === PAIRS) { sfx.win(); addStars(3); confetti(40); timers.push(setTimeout(draw, 900)); }
          else timers.push(setTimeout(draw, 500));
        } else {
          lock = true; sfx.no();
          timers.push(setTimeout(() => { open = []; lock = false; draw(); }, 900));
        }
      });
    }

    reset(); draw();
    return () => timers.forEach(clearTimeout);
  }
};
