import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Icon } from '@radix-ui/react-select';
import { Row } from '@tanstack/react-table';
import cn from '@libs/common/utils/className';

interface SelectableTextCellProps<TData> {
  icon?: React.ReactElement;
  row?: Row<TData>;
  text: string;
  onClick?: () => void;
  className?: string;
  isFirstColumn?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectableTextCell = forwardRef<HTMLDivElement, SelectableTextCellProps<any>>(
  ({ icon, row, text, onClick, className, isFirstColumn = false }, ref) => {
    const isChecked = row?.getIsSelected();
    const checkboxRef = useRef<HTMLDivElement>(null);
    const [checkboxWidth, setCheckboxWidth] = useState(0);

    useEffect(() => {
      if (checkboxRef.current) {
        const width = checkboxRef.current.offsetWidth;
        setCheckboxWidth(width);
      }
    }, []);

    return (
      <div
        ref={ref}
        onClick={onClick}
        onKeyDown={onClick}
        tabIndex={0}
        role="button"
        className={cn(
          `flex items-center justify-start ${isFirstColumn ? 'space-x-2' : ''} py-0`,
          onClick ? 'cursor-pointer' : 'cursor-default',
          className,
        )}
      >
        {row ? (
          <div ref={checkboxRef}>
            <Checkbox
              checked={isChecked}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={(checked) => {
                row.toggleSelected(!!checked);
              }}
              aria-label="Select row"
            />
          </div>
        ) : (
          <div className="my-5" />
        )}
        {icon ? <Icon className="mb-3 ml-2 mr-2 mt-3">{icon}</Icon> : null}
        <span
          className="text-md truncate font-medium"
          style={{
            marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
          }}
        >
          {text}
        </span>
      </div>
    );
  },
);

SelectableTextCell.displayName = 'SelectableTextCell';

export default SelectableTextCell;
