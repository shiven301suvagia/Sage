import test from 'node:test';
import assert from 'node:assert/strict';
import { UserPreferencesStore } from './UserPreferences.js';

test('preferences use safe defaults and support updates', () => {
  const store = new UserPreferencesStore();
  assert.equal(store.get().proactiveEnabled, true);
  store.update({ proactiveEnabled: false, theme: 'dark' });
  assert.equal(store.get().proactiveEnabled, false);
  assert.equal(store.get().theme, 'dark');
});
