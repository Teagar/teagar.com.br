import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (n) => JSON.parse(await readFile(new URL(`../src/content/${n}.json`, import.meta.url), 'utf8'));

function shape(v) {
  if (Array.isArray(v)) return { arr: v.length, items: v.map(shape) };
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]));
  return typeof v;
}

test('locales share the same recursive key structure', async () => {
  assert.deepEqual(shape(await load('pt-BR')), shape(await load('en')));
});
