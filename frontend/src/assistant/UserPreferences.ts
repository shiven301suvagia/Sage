export interface UserPreferences { readonly wakeOnInteraction: boolean; readonly proactiveEnabled: boolean; readonly voiceEnabled: boolean; readonly theme: 'system' | 'light' | 'dark'; }

export const DEFAULT_USER_PREFERENCES: UserPreferences = { wakeOnInteraction: true, proactiveEnabled: true, voiceEnabled: true, theme: 'system' };

export class UserPreferencesStore {
  private value: UserPreferences;
  constructor(initial: Partial<UserPreferences> = {}) { this.value = { ...DEFAULT_USER_PREFERENCES, ...initial }; }
  get(): UserPreferences { return { ...this.value }; }
  update(patch: Partial<UserPreferences>): UserPreferences { this.value = { ...this.value, ...patch }; return this.get(); }
}
