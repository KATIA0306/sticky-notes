import type { Note } from '../types';

const KEY = 'sticky_notes_v1';

export const storage = {
  load(): Note[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Note[]) : [];
    } catch {
      return [];
    }
  },

  save(notes: Note[]): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      // Silently ignore QuotaExceededError or unavailable storage
    }
  },
};
