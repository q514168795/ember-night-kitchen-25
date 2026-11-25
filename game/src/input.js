// SPDX-License-Identifier: MIT
// Keyboard and pointer input. The game itself decides what a station does, so this file only
// translates raw input into the game's named interactions.
import { INGREDIENTS, findHit } from './config.js';

const INGREDIENT_KEYS = new Map(INGREDIENTS.map((item) => [`Key${item.key}`, item.id]));
const STATION_KEYS = new Map([
  ['Digit1', 'prep'],
  ['Digit2', 'burner0'],
  ['Digit3', 'burner1'],
  ['Digit4', 'plate'],
  ['Digit5', 'serve'],
]);

export function createInput(canvas, renderer, actions) {
  const handled = new Set([
    ...INGREDIENT_KEYS.keys(),
    ...STATION_KEYS.keys(),
    'Space', 'Enter', 'ArrowUp', 'ArrowDown', 'Backspace', 'KeyC', 'KeyP', 'KeyM',
  ]);

  function clickAt(event) {
    const point = renderer.logicalPoint(event);
    const hit = findHit(point, actions.isPaused());
    renderer.setHover(hit);
    actions.click(hit);
  }

  window.addEventListener('keydown', (event) => {
    if (!handled.has(event.code)) return;
    event.preventDefault();
    if (event.repeat && !['ArrowUp', 'ArrowDown'].includes(event.code)) return;
    actions.unlockAudio();
    const ingredient = INGREDIENT_KEYS.get(event.code);
    if (ingredient) {
      actions.addIngredient(ingredient);
      return;
    }
    const station = STATION_KEYS.get(event.code);
    if (station) {
      if (station === 'prep') actions.prep();
      else if (station === 'plate') actions.plate();
      else if (station === 'serve') actions.serve();
      else actions.burner(Number(station.at(-1)));
      return;
    }
    if (event.code === 'Space' || event.code === 'Enter') actions.primary();
    else if (event.code === 'ArrowUp') actions.cycle(-1);
    else if (event.code === 'ArrowDown') actions.cycle(1);
    else if (event.code === 'Backspace') actions.clearHands();
    else if (event.code === 'KeyC') actions.clearPlate();
    else if (event.code === 'KeyP') actions.pause();
    else if (event.code === 'KeyM') actions.toggleSound();
  });

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    actions.unlockAudio();
    clickAt(event);
  });
  canvas.addEventListener('pointermove', (event) => {
    renderer.setHover(findHit(renderer.logicalPoint(event), actions.isPaused()));
  });
  canvas.addEventListener('pointerleave', () => renderer.clearHover());
  window.addEventListener('blur', () => renderer.clearHover());

  return { stop() {} };
}
