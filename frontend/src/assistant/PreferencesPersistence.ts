import type { UserPreferences } from './UserPreferences.js';
import { DEFAULT_USER_PREFERENCES } from './UserPreferences.js';

export interface PreferencesPersistence { load(): UserPreferences; save(value: UserPreferences): void; }

export class VolatilePreferencesPersistence implements PreferencesPersistence {
  private value: UserPreferences = { ...DEFAULT_USER_PREFERENCES };
  load(): UserPreferences { return { ...this.value }; }
  save(value: UserPreferences): void { this.value = { ...value }; }
}
