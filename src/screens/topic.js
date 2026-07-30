import { paint, topBar, on } from '../core/ui.js';
import { getTopic } from '../core/content.js';
import { activitiesFor } from '../activities/index.js';
import { navigate } from '../core/router.js';
import { getTopicStats } from '../core/storage.js';

export default function topicScreen({ topicId }) {
  const topic = getTopic(topicId);
  if (!topic) return navigate('/');
  const stats = getTopicStats(topic.id);

  paint(topBar(topic.icon + ' ' + topic.vi, '/') + `
    <div class="acts">
      ${activitiesFor(topic).map(a => `
        <button class="cut act" data-a="${a.id}">
          <div class="emo">${a.icon}</div>
          <div>
            <div class="t">${a.vi}</div>
            <div class="d">${a.desc}${stats.plays[a.id] ? ` · đã chơi ${stats.plays[a.id]} lần` : ''}</div>
          </div>
          <div class="go">›</div>
        </button>`).join('')}
    </div>`);

  on('[data-a]', el => navigate(`/play/${topic.id}/${el.dataset.a}`));
}
