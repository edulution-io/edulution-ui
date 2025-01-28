import React from 'react';
import SelectableCell from '@/components/ui/Table/SelectableCell';
import { IoArrowDownOutline, IoArrowUpOutline } from 'react-icons/io5';

interface SortTableCellProps {
  moveUp: () => Promise<void>;
  moveDown: () => Promise<void>;
  position: number;
  lastPosition: number;
}

const SortTableCell = ({ moveUp, moveDown, position, lastPosition }: SortTableCellProps) => {
  const isDisabledUp = position === 1;
  const isDisabledDown = position === lastPosition;

  return (
    <SelectableCell>
      {position}
      <button
        type="button"
        onClick={moveUp}
        disabled={isDisabledUp}
        className={`ml-2 ${isDisabledUp ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <IoArrowUpOutline />
      </button>
      <button
        type="button"
        onClick={moveDown}
        disabled={isDisabledDown}
        className={isDisabledDown ? 'text-foreground' : 'text-muted-foreground'}
      >
        <IoArrowDownOutline />
      </button>
    </SelectableCell>
  );
};

export default SortTableCell;
