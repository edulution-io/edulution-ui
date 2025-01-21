import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Checkbox from '@/components/ui/Checkbox';
import { Row } from '@tanstack/react-table';
import cn from '@libs/common/utils/className';

interface SelectableTextCellProps<TData> {
  icon?: React.ReactElement;
  row?: Row<TData>;
  text?: string;
  textOnHover?: string;
  iconOnHover?: string;
  onClick?: () => void;
  className?: string;
  isFirstColumn?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectableTextCell = forwardRef<HTMLDivElement, SelectableTextCellProps<any>>(
  ({ icon, row, text, textOnHover, iconOnHover, onClick, className, isFirstColumn = false }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        {icon ? <div className="mb-3 ml-2 mr-2 mt-3 flex items-center justify-center">{icon}</div> : null}
        {!isHovered && text}
        {isHovered && iconOnHover && (
          <img
            src={iconOnHover}
            width={'24px'}
            className={'h-[24px] w-[24px]'}
            aria-label={text || 'details'}
            alt={textOnHover || 'details'}
          />
        )}
        {isHovered &&
          !iconOnHover &&
          (textOnHover ? (
            <span
              className="text-md truncate font-medium"
              style={{
                marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
              }}
            >
              {textOnHover}
            </span>
          ) : (
            text
          ))}
      </div>
    );
  },
);

SelectableTextCell.displayName = 'SelectableTextCell';

export default SelectableTextCell;
