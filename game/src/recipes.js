// SPDX-License-Identifier: MIT
// Original menu data: four recipes, their preparation states and service prices.
import { PREP_LABEL } from './config.js';

export const RECIPES = [
  {
    id: 'moon-miso',
    name: 'Moon Miso Noodles',
    note: 'A warm late-night bowl',
    price: 180,
    color: '#d97706',
    components: [
      { id: 'noodles', prep: 'cooked' },
      { id: 'broth', prep: 'cooked' },
      { id: 'mushroom', prep: 'chopped' },
    ],
  },
  {
    id: 'ember-rice',
    name: 'Ember Tofu Rice',
    note: 'Charred edges, bright pepper',
    price: 200,
    color: '#0f766e',
    components: [
      { id: 'rice', prep: 'cooked' },
      { id: 'tofu', prep: 'choppedCooked' },
      { id: 'pepper', prep: 'chopped' },
    ],
  },
  {
    id: 'herb-bun',
    name: 'Herb Cloud Bun',
    note: 'Steamed and lifted with herbs',
    price: 170,
    color: '#54a57c',
    components: [
      { id: 'bun', prep: 'cooked' },
      { id: 'mushroom', prep: 'chopped' },
      { id: 'herbs', prep: 'raw' },
    ],
  },
  {
    id: 'midnight-soup',
    name: 'Midnight Garden Soup',
    note: 'Broth, char and green finish',
    price: 190,
    color: '#a88472',
    components: [
      { id: 'broth', prep: 'cooked' },
      { id: 'tofu', prep: 'choppedCooked' },
      { id: 'herbs', prep: 'raw' },
    ],
  },
];

export function sameComponents(left, right) {
  if (left.length !== right.length) return false;
  const key = (part) => `${part.id}:${part.prep}`;
  const counts = new Map();
  for (const part of left) counts.set(key(part), (counts.get(key(part)) ?? 0) + 1);
  for (const part of right) {
    const partKey = key(part);
    const remaining = counts.get(partKey) ?? 0;
    if (remaining === 0) return false;
    counts.set(partKey, remaining - 1);
  }
  return true;
}

export function describeComponent(component) {
  return `${component.id} · ${PREP_LABEL[component.prep]}`;
}
