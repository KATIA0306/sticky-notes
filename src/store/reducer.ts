import type { Note, NoteAction } from '../types';

export interface State {
  notes: Note[];
  topZ: number;
}

export const initialState: State = { notes: [], topZ: 0 };

export function reducer(state: State, action: NoteAction): State {
  switch (action.type) {
    case 'LOAD': {
      const topZ = action.payload.reduce((z, n) => Math.max(z, n.zIndex), 0);
      return { notes: action.payload, topZ };
    }

    case 'CREATE': {
      const topZ = state.topZ + 1;
      return {
        notes: [...state.notes, { ...action.payload, zIndex: topZ }],
        topZ,
      };
    }

    case 'UPDATE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? { ...n, ...action.payload } : n,
        ),
      };

    // Re-inserts with original zIndex so a rolled-back note doesn't jump to front
    case 'RESTORE':
      // Guard against double-firing
      if (state.notes.some(n => n.id === action.payload.id)) return state;
      return { ...state, notes: [...state.notes, action.payload] };

    case 'DELETE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload),
      };

    case 'BRING_TO_FRONT': {
      const topZ = state.topZ + 1;
      return {
        notes: state.notes.map(n =>
          n.id === action.payload ? { ...n, zIndex: topZ } : n,
        ),
        topZ,
      };
    }

    default:
      return state;
  }
}
