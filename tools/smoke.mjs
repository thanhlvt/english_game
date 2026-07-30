/**
 * Smoke test không cần trình duyệt:  npm run smoke
 * Render lần lượt mọi màn hình bằng jsdom và kiểm tra ghi localStorage.
 * Chạy sau khi thêm hoạt động mới hoặc sửa router/storage.
 */
import { JSDOM } from 'jsdom';
const dom = new JSDOM(`<!doctype html><html><body><div id="app"></div><div id="fx"></div></body></html>`,
  { url: 'http://localhost/#/', pretendToBeVisual: true });
const w = dom.window;
global.window = w; global.document = w.document;
global.location = w.location; global.Blob = w.Blob; global.Audio = w.Audio;
global.HTMLElement = w.HTMLElement; global.Element = w.Element;
global.confirm = () => true;
global.localStorage = w.localStorage;  // localStorage thật của jsdom

const errors = [];
w.addEventListener('error', e => errors.push(e.message));

const { route, start, navigate } = await import('../src/core/router.js');
const { validate, getTopic } = await import('../src/core/content.js');
const { getActivity, ACTIVITIES } = await import('../src/activities/index.js');
const home = (await import('../src/screens/home.js')).default;
const topicScreen = (await import('../src/screens/topic.js')).default;
const parent = (await import('../src/screens/parent.js')).default;
const storage = await import('../src/core/storage.js');

route('/', home);
route('/topic/:topicId', topicScreen);
route('/parent', parent);
route('/story', () => getActivity('story-studio').mount({ back: '/' }));
route('/play/:topicId/:activityId', ({ topicId, activityId }) => {
  const t = getTopic(topicId), a = getActivity(activityId);
  if (!t || !a) return navigate('/');
  return a.mount({ topic: t, back: '/topic/' + topicId });
});
start();

const app = w.document.getElementById('app');
const check = (label, mustContain) => {
  const html = app.innerHTML;
  const ok = html.length > 100 && (!mustContain || html.includes(mustContain));
  console.log((ok ? '  ok  ' : '  FAIL') + '  ' + label + '  (' + html.length + ' ký tự)');
  if (!ok) { errors.push(label); console.log(html.slice(0, 300)); }
};

const nav = async p => { w.location.hash = '#' + p; await new Promise(r => setTimeout(r, 30)); };

console.log('Kiểm tra từng màn hình:');
await nav('/'); check('trang chủ', 'Chọn chủ đề');
await nav('/topic/animals'); check('menu chủ đề', 'Lật hình tìm cặp');
for (const a of ACTIVITIES.filter(x => !x.standalone)) {
  await nav('/play/animals/' + a.id); check('hoạt động ' + a.id, a.vi);
}
await nav('/story'); check('xưởng kể chuyện', 'Ghép câu của bé');
await nav('/parent'); check('góc bố mẹ', 'Góc bố mẹ');
await nav('/khong-ton-tai'); check('route sai -> về trang chủ', 'Chọn chủ đề');

// thử tương tác: trả lời đúng ở listen-pick có tăng sao không
await nav('/play/animals/listen-pick');
const before = storage.getStars();
const prompt = app.querySelector('.prompt');
console.log('\nKiểm tra tương tác:');
console.log((prompt ? '  ok  ' : '  FAIL') + '  câu hỏi hiển thị');
storage.recordAnswer('animals', 'cat', true);
storage.addStars(1);
console.log((storage.getStars() === before + 1 ? '  ok  ' : '  FAIL') + '  cộng sao vào localStorage');
console.log((storage.getWord('animals', 'cat').box === 1 ? '  ok  ' : '  FAIL') + '  hộp Leitner tăng khi trả lời đúng');
console.log('  ok    dữ liệu đã ghi: ' + (w.localStorage.getItem('bhta:progress') || '').slice(0, 70) + '...');

console.log(errors.length ? '\nCÓ LỖI: ' + errors.join(', ') : '\nTất cả màn hình render bình thường.');
process.exit(errors.length ? 1 : 0);
