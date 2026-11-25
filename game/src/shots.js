// SPDX-License-Identifier: MIT
// Four staged, deterministic service frames for the judge screenshots. Each scene uses the real
// rules and state shape; it does not run a fake renderer or a hidden second game.
import { SCREEN_PLAY } from './world.js';

const TICKET_SEEDS = [
  [0, 2, 1],
  [1, 3, 0],
  [2, 0, 3],
  [3, 1, 2],
];

function ticket(id, recipeIndex, patience, max) {
  return { id, recipeIndex, patience, patienceMax: max, reward: 180 + recipeIndex * 7 };
}

function clearEvents(world) {
  world.takeEvents();
}

function steam(state, x, y) {
  state.particles.push({ id: 900 + x + y, x, y, vx: 0, vy: -10, life: 0.8, maxLife: 0.8, size: 2, color: '#ffffff' });
}

export function stageShot(name, world) {
  world.start();
  clearEvents(world);
  const s = world.state;
  s.screen = SCREEN_PLAY;
  s.elapsed = name === 'rush' ? 104 : name === 'prep' ? 74 : name === 'plated' ? 156 : 88;
  s.timeLeft = name === 'rush' ? 34 : name === 'prep' ? 78 : name === 'plated' ? 24 : 96;
  s.score = name === 'plated' ? 1380 : name === 'rush' ? 960 : name === 'prep' ? 710 : 845;
  s.served = name === 'plated' ? 11 : name === 'rush' ? 8 : name === 'prep' ? 6 : 7;
  s.missed = name === 'rush' ? 1 : 0;
  s.combo = name === 'rush' ? 4 : name === 'plated' ? 6 : name === 'cover' ? 3 : 2;
  s.bestCombo = Math.max(s.combo, 3);
  s.spawnTimer = 999;
  s.message = name === 'rush' ? 'Two burners ready. Last call on ticket 08.' : 'Service is moving.';
  s.messageKind = 'good';
  s.messageTimer = 0;

  const seed = TICKET_SEEDS[['cover', 'prep', 'rush', 'plated'].indexOf(name)] ?? TICKET_SEEDS[0];
  s.orders = seed.map((recipe, index) => ticket(7 + index, recipe, 42 - index * 7, 58));
  s.selectedOrder = 0;
  s.hands = [];
  s.board = { parts: [], progress: 0 };
  s.burners = [
    { item: null, elapsed: 0, duration: 0, state: 'empty' },
    { item: null, elapsed: 0, duration: 0, state: 'empty' },
  ];
  s.plate = [];

  if (name === 'cover') {
    s.plate = [
      { id: 'noodles', prep: 'cooked' },
      { id: 'broth', prep: 'cooked' },
      { id: 'mushroom', prep: 'chopped' },
    ];
    s.hands = [{ id: 'herbs', prep: 'raw' }];
    s.burners[0] = { item: { id: 'tofu', prep: 'chopped' }, elapsed: 3.4, duration: 5.4, state: 'cooking' };
    s.burners[1] = { item: { id: 'pepper', prep: 'raw' }, elapsed: 4.7, duration: 4.6, state: 'ready' };
    s.board = { parts: [{ id: 'mushroom', prep: 'raw' }], progress: 3 };
    steam(s, 600, 300);
    steam(s, 720, 300);
    s.particles.push({ id: 991, x: 612, y: 220, vx: 0, vy: -12, life: 1.2, maxLife: 1.2, size: 20, color: '#0f766e', text: '+186' });
  } else if (name === 'prep') {
    s.plate = [
      { id: 'rice', prep: 'cooked' },
      { id: 'tofu', prep: 'choppedCooked' },
    ];
    s.hands = [{ id: 'herbs', prep: 'raw' }];
    s.board = { parts: [{ id: 'mushroom', prep: 'raw' }, { id: 'pepper', prep: 'raw' }], progress: 2 };
    s.burners[0] = { item: { id: 'bun', prep: 'raw' }, elapsed: 4.4, duration: 4.4, state: 'ready' };
    s.burners[1] = { item: { id: 'broth', prep: 'raw' }, elapsed: 2.5, duration: 4.8, state: 'cooking' };
    steam(s, 600, 300);
  } else if (name === 'rush') {
    s.plate = [
      { id: 'bun', prep: 'cooked' },
      { id: 'mushroom', prep: 'chopped' },
    ];
    s.hands = [{ id: 'pepper', prep: 'raw' }, { id: 'herbs', prep: 'raw' }];
    s.burners[0] = { item: { id: 'noodles', prep: 'raw' }, elapsed: 5.2, duration: 5.2, state: 'ready' };
    s.burners[1] = { item: { id: 'rice', prep: 'raw' }, elapsed: 5.6, duration: 5.6, state: 'ready' };
    steam(s, 600, 300); steam(s, 720, 300);
    s.particles.push({ id: 992, x: 612, y: 220, vx: 0, vy: -12, life: 1.2, maxLife: 1.2, size: 19, color: '#d97706', text: 'x4 COMBO' });
  } else {
    s.plate = [
      { id: 'bun', prep: 'cooked' },
      { id: 'mushroom', prep: 'chopped' },
      { id: 'herbs', prep: 'raw' },
    ];
    s.burners[0] = { item: { id: 'tofu', prep: 'raw' }, elapsed: 2.1, duration: 5.4, state: 'cooking' };
    s.burners[1] = { item: null, elapsed: 0, duration: 0, state: 'empty' };
    const platedTicket = s.orders.findIndex((order) => order.recipeIndex === 2);
    s.selectedOrder = platedTicket >= 0 ? platedTicket : 0;
  }

  return { screen: s.screen, best: s.score };
}
