/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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

const SelectableCellInner = <TData,>(
  { row, onClick, className, isFirstColumn = false, children }: SelectableCellProps<TData>,
  ref: React.Ref<HTMLDivElement>,
) => {
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
};

const SelectableCell = forwardRef(SelectableCellInner) as <TData>(
  props: SelectableCellProps<TData> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element;

export default SelectableCell;
