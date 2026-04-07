import { useReducer, useEffect, useRef, useCallback } from 'react';
import { reducer, initialState } from '../store/reducer';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { Note } from './Note';

export function Board() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const notesRef = useRef(state.notes);
  notesRef.current = state.notes;

  const textSaveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => () => { textSaveTimers.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    const saved = storage.load();
    if (saved.length === 0) return;
    dispatch({ type: 'LOAD', payload: saved });
    api.seed(saved);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => storage.save(state.notes), 400);
    return () => clearTimeout(timer);
  }, [state.notes]);

  const handleTextChange = useCallback((id: string, text: string) => {
    dispatch({ type: 'UPDATE', payload: { id, text } });
    // Debounce saves — one request per pause in typing, no rollback on failure
    const existing = textSaveTimers.current.get(id);
    if (existing) clearTimeout(existing);
    textSaveTimers.current.set(id, setTimeout(() => {
      textSaveTimers.current.delete(id);
      const note = notesRef.current.find(n => n.id === id);
      if (note) api.save({ ...note, text }).catch(console.error);
    }, 500));
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: id });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const prev = notesRef.current.find(n => n.id === id);
    dispatch({ type: 'DELETE', payload: id });
    try {
      await api.remove(id);
    } catch {
      if (prev) dispatch({ type: 'RESTORE', payload: prev });
    }
  }, []);

  return (
    <div className="board">
      <header className="toolbar" onClick={e => e.stopPropagation()}>
        <span className="toolbar__title">📝 Sticky Notes</span>
        <span className="toolbar__hint">Click anywhere on the board to add a note</span>
        <button className="toolbar__add-btn" type="button">
          + New Note
        </button>
      </header>

      {state.notes.map(note => (
        <Note
          key={note.id}
          note={note}
          onTextChange={handleTextChange}
          onBringToFront={handleBringToFront}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
