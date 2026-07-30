/**
 * Sổ đăng ký hoạt động.
 * Thêm hoạt động mới: tạo file theo hợp đồng trong .claude/skills/add-activity,
 * import rồi thêm vào mảng. Thứ tự = thứ tự hiển thị trong menu chủ đề.
 */
import flashcards from './flashcards.js';
import listenPick from './listen-pick.js';
import memoryMatch from './memory-match.js';
import spell from './spell.js';
import storyStudio from './story-studio.js';

export const ACTIVITIES = [flashcards, listenPick, memoryMatch, spell, storyStudio];

export const getActivity = id => ACTIVITIES.find(a => a.id === id) || null;

/** Hoạt động hiện trong menu của một chủ đề (đủ số từ và không phải standalone). */
export const activitiesFor = topic =>
  ACTIVITIES.filter(a => !a.standalone && topic.words.length >= (a.minWords || 1));
