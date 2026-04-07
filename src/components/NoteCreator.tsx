import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { NoteColor } from '../types';
import { NOTE_COLORS } from '../types';

interface Props {
  x: number;
  y: number;
  onCreate: (x: number, y: number, w: number, h: number, color: NoteColor) => void;
  onClose: () => void;
}

const COLORS      = Object.keys(NOTE_COLORS) as NoteColor[];
const PANEL_WIDTH  = 240;
const PANEL_HEIGHT = 260;
const DEFAULT_W    = 220;
const DEFAULT_H    = 160;
const TOOLBAR_H    = 52; // keep popover below the fixed toolbar

export function NoteCreator({ x, y, onCreate, onClose }: Props) {
  const [width, setWidth]   = useState(DEFAULT_W);
  const [height, setHeight] = useState(DEFAULT_H);
  const [color, setColor]   = useState<NoteColor>('yellow');
  const panelRef            = useRef<HTMLDivElement>(null);

  // Keep the popover within the viewport and below the toolbar
  const panelX = Math.max(12, Math.min(x, window.innerWidth  - PANEL_WIDTH  - 12));
  const panelY = Math.max(TOOLBAR_H + 8, Math.min(y, window.innerHeight - PANEL_HEIGHT - 12));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreate(x, y, width, height, color);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Auto-focus the first field
  useEffect(() => {
    (panelRef.current?.querySelector('input') as HTMLInputElement | null)?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      className="note-creator"
      style={{ left: panelX, top: panelY }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="note-creator__header">
        <span>New Note</span>
        <button
          className="note-creator__close"
          onClick={onClose}
          aria-label="Cancel"
          type="button"
        >
          ×
        </button>
      </div>

      <form className="note-creator__form" onSubmit={handleSubmit}>
        <label className="note-creator__field">
          <span>Width</span>
          <input
            type="number"
            min={150}
            max={600}
            value={width}
            onChange={e => setWidth(Math.max(150, Math.min(600, Number(e.target.value))))}
          />
        </label>

        <label className="note-creator__field">
          <span>Height</span>
          <input
            type="number"
            min={100}
            max={500}
            value={height}
            onChange={e => setHeight(Math.max(100, Math.min(500, Number(e.target.value))))}
          />
        </label>

        <div className="note-creator__color-row">
          <span className="note-creator__color-label">Color</span>
          <div className="note-creator__colors">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={[
                  'note-creator__swatch',
                  color === c ? 'note-creator__swatch--active' : '',
                ].filter(Boolean).join(' ')}
                style={{ background: NOTE_COLORS[c].header }}
                onClick={() => setColor(c)}
                aria-label={c}
                aria-pressed={color === c}
                title={c}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="note-creator__submit">
          Create Note
        </button>
      </form>
    </div>
  );
}
