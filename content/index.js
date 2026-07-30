/**
 * Danh mục nội dung. Thêm chủ đề mới: tạo file trong ./topics/ rồi import + thêm vào mảng.
 * Thứ tự trong mảng = thứ tự hiển thị ở trang chủ (dễ trước, khó sau).
 */
import animals from './topics/animals.js';
import colors from './topics/colors.js';
import numbers from './topics/numbers.js';
import family from './topics/family.js';
import food from './topics/food.js';
import body from './topics/body.js';
import nature from './topics/nature.js';

export const TOPICS = [animals, colors, numbers, family, food, body, nature];
