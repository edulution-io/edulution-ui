import React, { forwardRef } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Icon } from '@radix-ui/react-select';
import { Row } from '@tanstack/react-table';
import cn from '@/lib/utils';

interface SelectableTextCellProps<TData> {
  icon?: React.ReactElement;
  row?: Row<TData>;
  text: string;
  onClick?: () => void;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectableTextCell = forwardRef<HTMLDivElement, SelectableTextCellProps<any>>(
  ({ icon, row, text, onClick, className }, ref) => {
    const isChecked = row?.getIsSelected();

    return (
      <div
        ref={ref}
        onClick={onClick}
        onKeyDown={onClick}
        tabIndex={0}
        role="button"
        className={cn(
          'flex items-center justify-start space-x-2 py-1',
          onClick ? 'cursor-pointer' : 'cursor-default',
          className,
        )}
      >
        {row ? (
          <Checkbox
            checked={isChecked}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              row.toggleSelected(!!checked);
            }}
            aria-label="Select row"
          />
        ) : (
          <div className="mx-2 my-5" />
        )}
        {icon ? <Icon className="mb-3 ml-2 mr-2 mt-3">{icon}</Icon> : null}
        <span className="text-md truncate font-medium">{text}</span>
      </div>
    );
  },
);

SelectableTextCell.displayName = 'SelectableTextCell';

export default SelectableTextCell;
