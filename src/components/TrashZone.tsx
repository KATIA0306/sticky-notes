import { forwardRef } from 'react';

interface Props {
  isActive: boolean;
  isOver: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, Props>(({ isActive, isOver }, ref) => (
  <div
    ref={ref}
    className={[
      'trash-zone',
      isActive ? 'trash-zone--active' : '',
      isOver   ? 'trash-zone--over'   : '',
    ].filter(Boolean).join(' ')}
    aria-label="Drop zone — drag a note here to delete it"
    role="region"
  >
    <span className="trash-zone__icon" aria-hidden="true">🗑️</span>
    <span className="trash-zone__label">Drop to delete</span>
  </div>
));

TrashZone.displayName = 'TrashZone';
