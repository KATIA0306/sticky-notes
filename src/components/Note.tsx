import { memo, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import type { Note as NoteType } from '../types';
import { NOTE_COLORS } from '../types';

interface Props {
  note: NoteType;
  onTextChange: (id: string, text: string) => void;
  onBringToFront: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Note = memo(function Note({
  note,
  onTextChange,
  onBringToFront,
  onDelete,
}: Props) {
  const { bg, header } = NOTE_COLORS[note.color];

  const handleMouseDown = useCallback(() => {
    onBringToFront(note.id);
  }, [note.id, onBringToFront]);

  const handleDeleteClick = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(note.id);
  }, [note.id, onDelete]);

  return (
    <div
      className="note"
      style={{
        left:       note.x,
        top:        note.y,
        width:      note.width,
        height:     note.height,
        zIndex:     note.zIndex,
        background: bg,
      }}
      onMouseDown={handleMouseDown}
      aria-label={`Sticky note: ${note.text.slice(0, 40) || 'empty'}`}
    >
      <div className="note__header" style={{ background: header }}>
        <span className="note__color-name">{note.color}</span>
        <button
          className="note__delete-btn"
          onClick={handleDeleteClick}
          onMouseDown={e => e.stopPropagation()}
          aria-label="Delete note"
          type="button"
          title="Delete note"
        >
          ×
        </button>
      </div>

      <textarea
        className="note__body"
        value={note.text}
        onChange={e => onTextChange(note.id, e.target.value)}
        placeholder="Type your note…"
        spellCheck={true}
        aria-label="Note text"
      />
    </div>
  );
});
