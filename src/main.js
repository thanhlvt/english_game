import { route, start, navigate } from './core/router.js';
import { validate, getTopic } from './core/content.js';
import { getActivity } from './activities/index.js';
import home from './screens/home.js';
import topicScreen from './screens/topic.js';
import parent from './screens/parent.js';

validate(); // cảnh báo dữ liệu sai trong console khi dev

route('/', home);
route('/topic/:topicId', topicScreen);
route('/parent', parent);

route('/story', () => {
  const act = getActivity('story-studio');
  return act.mount({ back: '/' });
});

route('/play/:topicId/:activityId', ({ topicId, activityId }) => {
  const topic = getTopic(topicId);
  const act = getActivity(activityId);
  if (!topic || !act) return navigate('/');
  return act.mount({ topic, back: '/topic/' + topicId });
});

start();
