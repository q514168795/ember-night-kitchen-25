// SPDX-License-Identifier: MIT
// Shared measurements, palette, ingredients and clickable regions for Ember Night Kitchen.
export const WORLD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const MAX_FRAME = 0.25;
export const SHIFT_SECONDS = 180;
export const BEST_KEY = 'ember-night-kitchen-best';

export const COLOR = {
  ink: '#18181b',
  paper: '#f4f4f5',
  card: '#ffffff',
  line: '#e4e4e7',
  subtle: '#f1f1f2',
  muted: '#71717a',
  faint: '#a1a1aa',
  black: '#101012',
  amber: '#d97706',
  amberSoft: '#f59e0b',
  teal: '#0f766e',
  red: '#dc2626',
  night: '#17171b',
};

export const FONT = "'Inter','SF Pro Display','Segoe UI',system-ui,-apple-system,sans-serif";

export const PREP_LABEL = {
  raw: 'RAW',
  chopped: 'CHOPPED',
  cooked: 'COOKED',
  choppedCooked: 'CHARRED',
  burnt: 'BURNT',
};

export const INGREDIENTS = [
  { id: 'noodles', name: 'Noodles', key: 'Q', cook: 5.2, chop: false, bowl: '#f2c14e', line: '#b97d1d', detail: '#fff4cf' },
  { id: 'broth', name: 'Miso broth', key: 'W', cook: 4.8, chop: false, bowl: '#c88348', line: '#8d5424', detail: '#f7dfbb' },
  { id: 'rice', name: 'Jasmine rice', key: 'E', cook: 5.6, chop: false, bowl: '#f8fafc', line: '#b9bec6', detail: '#ffffff' },
  { id: 'mushroom', name: 'Mushroom', key: 'R', cook: 5.0, chop: true, bowl: '#b08a72', line: '#795548', detail: '#f0e0cf' },
  { id: 'pepper', name: 'Sweet pepper', key: 'T', cook: 4.6, chop: true, bowl: '#ef6a5b', line: '#b93b31', detail: '#ffd9cd' },
  { id: 'tofu', name: 'Silken tofu', key: 'Y', cook: 5.4, chop: true, bowl: '#f5e7c6', line: '#b8a068', detail: '#fffaf0' },
  { id: 'herbs', name: 'Fresh herbs', key: 'U', cook: 2.8, chop: true, bowl: '#54a57c', line: '#246b4c', detail: '#cdf0da' },
  { id: 'bun', name: 'Cloud bun', key: 'I', cook: 4.4, chop: false, bowl: '#efe3cf', line: '#a98e65', detail: '#fffaf0' },
];

export const INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

// Rectangles are in the game's 1280 x 720 coordinate system.
export const HIT = {
  orderCards: [
    { x: 28, y: 108, width: 268, height: 132 },
    { x: 28, y: 252, width: 268, height: 132 },
    { x: 28, y: 396, width: 268, height: 132 },
  ],
  crates: INGREDIENTS.map((_, index) => ({ x: 24 + index * 95, y: 604, width: 89, height: 78 })),
  prep: { x: 326, y: 248, width: 186, height: 226 },
  burner: [
    { x: 548, y: 300, width: 104, height: 104 },
    { x: 668, y: 300, width: 104, height: 104 },
  ],
  plate: { x: 824, y: 248, width: 100, height: 226 },
  serve: { x: 990, y: 474, width: 248, height: 52 },
  trash: { x: 1032, y: 630, width: 56, height: 48 },
  pause: { x: 1094, y: 630, width: 56, height: 48 },
  sound: { x: 1156, y: 630, width: 56, height: 48 },
  resume: { x: 510, y: 452, width: 260, height: 52 },
};

export function inside(rect, point) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function findHit(point, includeResume = false) {
  if (includeResume && inside(HIT.resume, point)) return { kind: 'resume' };
  for (let index = 0; index < HIT.orderCards.length; index += 1) {
    if (inside(HIT.orderCards[index], point)) return { kind: 'order', index };
  }
  for (let index = 0; index < HIT.crates.length; index += 1) {
    if (inside(HIT.crates[index], point)) return { kind: 'crate', index };
  }
  if (inside(HIT.prep, point)) return { kind: 'prep' };
  for (let index = 0; index < HIT.burner.length; index += 1) {
    if (inside(HIT.burner[index], point)) return { kind: 'burner', index };
  }
  if (inside(HIT.plate, point)) return { kind: 'plate' };
  if (inside(HIT.serve, point)) return { kind: 'serve' };
  if (inside(HIT.trash, point)) return { kind: 'trash' };
  if (inside(HIT.pause, point)) return { kind: 'pause' };
  if (inside(HIT.sound, point)) return { kind: 'sound' };
  return null;
}
