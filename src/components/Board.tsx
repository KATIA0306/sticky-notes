import { useReducer, useEffect } from 'react';
import { reducer, initialState } from '../store/reducer';
import { storage } from '../services/storage';
import { api } from '../services/api';

export function Board() {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  return (
    <div className="board">
      <header className="toolbar">
        <span className="toolbar__title">📝 Sticky Notes</span>
        <span className="toolbar__hint">Click anywhere on the board to add a note</span>
        <button className="toolbar__add-btn" type="button">
          + New Note
        </button>
      </header>
    </div>
  );
}
