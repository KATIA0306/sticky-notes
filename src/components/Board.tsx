import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { reducer, initialState } from '../store/reducer';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { useDragManager } from '../hooks/useDragManager';
import { Note } from './Note';
import { TrashZone } from './TrashZone';
import type { Note as NoteType } from '../types';

export function Board() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const noteRefs  = useRef(new Map<string, HTMLDivElement>());
  const trashRef  = useRef<HTMLDivElement>(null);

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

  // Returns a stable callback reference per note ID so React.memo isn't defeated
  // by a new inline function on every render.
  const noteRefCallbacks = useRef(new Map<string, (el: HTMLDivElement | null) => void>());
  const getRefCallback = useCallback((id: string) => {
    if (!noteRefCallbacks.current.has(id)) {
      noteRefCallbacks.current.set(id, (el: HTMLDivElement | null) => {
        if (el) noteRefs.current.set(id, el);
        else    noteRefs.current.delete(id);
      });
    }
    return noteRefCallbacks.current.get(id)!;
  }, []);

  const handleMoveCommit = useCallback(async (id: string, x: number, y: number) => {
    const prev = notesRef.current.find(n => n.id === id);
    if (!prev) return;
    dispatch({ type: 'UPDATE', payload: { id, x, y } });
    try {
      await api.save({ ...prev, x, y });
    } catch {
      dispatch({ type: 'UPDATE', payload: { id, x: prev.x, y: prev.y } });
    }
  }, []);

  const handleResizeCommit = useCallback(async (id: string, width: number, height: number) => {
    const prev = notesRef.current.find(n => n.id === id);
    if (!prev) return;
    dispatch({ type: 'UPDATE', payload: { id, width, height } });
    try {
      await api.save({ ...prev, width, height });
    } catch {
      dispatch({ type: 'UPDATE', payload: { id, width: prev.width, height: prev.height } });
    }
  }, []);

  const handleDeleteByTrash = useCallback(async (id: string) => {
    const prev = notesRef.current.find(n => n.id === id);
    dispatch({ type: 'DELETE', payload: id });
    try {
      await api.remove(id);
    } catch {
      if (prev) dispatch({ type: 'RESTORE', payload: prev });
    }
  }, []);

  const { startMove, startResize, draggingId, isOverTrash } = useDragManager({
    noteRefs,
    trashRef,
    onMoveCommit:    handleMoveCommit,
    onResizeCommit:  handleResizeCommit,
    onDeleteByTrash: handleDeleteByTrash,
  });

  const handleMoveStart = useCallback((note: NoteType, mouseX: number, mouseY: number) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: note.id });
    startMove(note, mouseX, mouseY);
  }, [startMove]);

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
          isDragging={draggingId === note.id}
          isTrashTarget={draggingId === note.id && isOverTrash}
          onRef={getRefCallback(note.id)}
          onMoveStart={handleMoveStart}
          onResizeStart={startResize}
          onTextChange={handleTextChange}
          onBringToFront={handleBringToFront}
          onDelete={handleDelete}
        />
      ))}

      <TrashZone ref={trashRef} isActive={draggingId !== null} isOver={isOverTrash} />
    </div>
  );
}
