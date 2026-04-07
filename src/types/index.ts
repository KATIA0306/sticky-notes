export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'lavender';

/** Background and header palette for each color variant */
export const NOTE_COLORS: Record<NoteColor, { bg: string; header: string }> = {
  yellow:   { bg: '#FFFDE7', header: '#FFE082' },
  pink:     { bg: '#FCE4EC', header: '#F48FB1' },
  blue:     { bg: '#E3F2FD', header: '#90CAF9' },
  green:    { bg: '#E8F5E9', header: '#A5D6A7' },
  orange:   { bg: '#FFF3E0', header: '#FFCC80' },
  lavender: { bg: '#EDE7F6', header: '#CE93D8' },
};

export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: NoteColor;
  zIndex: number;
}

export type NoteAction =
  | { type: 'LOAD';           payload: Note[] }
  | { type: 'CREATE';         payload: Note }
  | { type: 'RESTORE';        payload: Note }   // re-inserts with original zIndex (used for rollback)
  | { type: 'UPDATE';         payload: Partial<Note> & { id: string } }
  | { type: 'DELETE';         payload: string }
  | { type: 'BRING_TO_FRONT'; payload: string };
