import { useRef, useState, useEffect, useCallback, type RefObject } from 'react';
import type { Note } from '../types';

interface DragSession {
  noteId: string;
  type: 'move' | 'resize';
  startMouseX: number;
  startMouseY: number;
  origin: { x: number; y: number; w: number; h: number };
}

interface Options {
  noteRefs: RefObject<Map<string, HTMLDivElement>>;
  trashRef: RefObject<HTMLDivElement>;
  onMoveCommit: (id: string, x: number, y: number) => void;
  onResizeCommit: (id: string, width: number, height: number) => void;
  onDeleteByTrash: (id: string) => void;
}

interface DragManager {
  startMove: (note: Note, mouseX: number, mouseY: number) => void;
  startResize: (note: Note, mouseX: number, mouseY: number) => void;
  draggingId: string | null;
  isOverTrash: boolean;
}

export function useDragManager({
  noteRefs,
  trashRef,
  onMoveCommit,
  onResizeCommit,
  onDeleteByTrash,
}: Options): DragManager {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const drag = useRef<DragSession | null>(null);

  // Ref so the effect doesn't re-register when callers swap callbacks
  const callbacks = useRef({ onMoveCommit, onResizeCommit, onDeleteByTrash });
  callbacks.current = { onMoveCommit, onResizeCommit, onDeleteByTrash };

  const startMove = useCallback((note: Note, mouseX: number, mouseY: number) => {
    drag.current = {
      noteId: note.id,
      type: 'move',
      startMouseX: mouseX,
      startMouseY: mouseY,
      origin: { x: note.x, y: note.y, w: note.width, h: note.height },
    };
    setDraggingId(note.id);
    document.body.style.cursor     = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  const startResize = useCallback((note: Note, mouseX: number, mouseY: number) => {
    drag.current = {
      noteId: note.id,
      type: 'resize',
      startMouseX: mouseX,
      startMouseY: mouseY,
      origin: { x: note.x, y: note.y, w: note.width, h: note.height },
    };
    setDraggingId(note.id);
    document.body.style.cursor     = 'se-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const hitTrash = (x: number, y: number): boolean => {
      if (!trashRef.current) return false;
      const r = trashRef.current.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const session = drag.current;
      if (!session) return;

      const el = noteRefs.current?.get(session.noteId);
      if (!el) return;

      const dx = e.clientX - session.startMouseX;
      const dy = e.clientY - session.startMouseY;

      if (session.type === 'move') {
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        setIsOverTrash(hitTrash(e.clientX, e.clientY));
      } else {
        el.style.width  = `${Math.max(150, session.origin.w + dx)}px`;
        el.style.height = `${Math.max(100, session.origin.h + dy)}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const session = drag.current;
      if (!session) return;

      drag.current = null;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';

      const el = noteRefs.current?.get(session.noteId);
      const dx = e.clientX - session.startMouseX;
      const dy = e.clientY - session.startMouseY;

      if (session.type === 'move') {
        if (el) el.style.transform = '';

        if (hitTrash(e.clientX, e.clientY)) {
          callbacks.current.onDeleteByTrash(session.noteId);
          setIsOverTrash(false);
          setDraggingId(null);
          return;
        }

        callbacks.current.onMoveCommit(
          session.noteId,
          Math.max(0, session.origin.x + dx),
          Math.max(0, session.origin.y + dy),
        );
        setIsOverTrash(false);
      } else {
        if (el) {
          el.style.removeProperty('width');
          el.style.removeProperty('height');
        }
        callbacks.current.onResizeCommit(
          session.noteId,
          Math.max(150, session.origin.w + dx),
          Math.max(100, session.origin.h + dy),
        );
      }

      setDraggingId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup',   handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup',   handleMouseUp);
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — callbacks accessed via ref

  return { startMove, startResize, draggingId, isOverTrash };
}
