import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Row } from '@tanstack/react-table';
import cn from '@libs/common/utils/className';

interface SelectableCellProps<TData> {
  row?: Row<TData>;
  onClick?: () => void;
  className?: string;
  isFirstColumn?: boolean;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectableCell = forwardRef<HTMLDivElement, SelectableCellProps<any>>(
  ({ row, onClick, className, isFirstColumn = false, children }, ref) => {
    const isChecked = row?.getIsSelected();
    const checkboxRef = useRef<HTMLButtonElement>(null);
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
          <Checkbox
            ref={checkboxRef}
            checked={isChecked}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              row.toggleSelected(!!checked);
            }}
            aria-label="Select row"
          />
        ) : (
          <div className="my-5" />
        )}
        <span
          className="text-md truncate font-medium"
          style={{
            marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
          }}
        >
          {children}
        </span>
      </div>
    );
  },
);

SelectableCell.displayName = 'SelectableTextCell';

export default SelectableCell;
