import type { Note } from '../types';

/** Simulated network latency in ms */
const LATENCY = 120;

const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// In-memory store simulating a server-side database
const serverStore = new Map<string, Note>();

/**
 * Mock REST API. Each method mirrors what a real fetch-based client would look like,
 * making it straightforward to swap this module for a real implementation later.
 */
export const api = {
  /**
   * Populate the mock server with an initial dataset.
   * Call this once on app boot after restoring notes from localStorage so the
   * "server" and client start from the same state. A real API wouldn't need this —
   * the server is always the source of truth on load.
   */
  seed(notes: Note[]): void {
    notes.forEach(n => serverStore.set(n.id, { ...n }));
  },

  async fetchAll(): Promise<Note[]> {
    await pause(LATENCY);
    return Array.from(serverStore.values());
  },

  async save(note: Note): Promise<Note> {
    await pause(LATENCY);
    const stored = { ...note };
    serverStore.set(note.id, stored);
    return stored;
  },

  async remove(id: string): Promise<void> {
    await pause(LATENCY);
    serverStore.delete(id);
  },
};
