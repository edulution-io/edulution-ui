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

interface SelectableTextCellProps<TData> {
  icon?: React.ReactElement;
  row?: Row<TData>;
  text?: string | JSX.Element;
  textOnHover?: string;
  onClick?: () => void;
  className?: string;
  isFirstColumn?: boolean;
}

const SelectableTextCellInner = <TData,>(
  { icon, row, text, textOnHover, onClick, className, isFirstColumn = false }: SelectableTextCellProps<TData>,
  ref: React.Ref<HTMLDivElement>,
) => {
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
        `flex items-center justify-start ${isFirstColumn ? 'space-x-2' : ''} min-w-4 py-0`,
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
      <span
        className="text-md truncate font-medium"
        style={{
          marginLeft: isFirstColumn && !row ? `${checkboxWidth + 30}px` : undefined,
        }}
      >
        {isHovered && textOnHover ? textOnHover : text}
      </span>
    </div>
  );
};

const SelectableTextCell = forwardRef(SelectableTextCellInner) as <TData>(
  props: SelectableTextCellProps<TData> & React.RefAttributes<HTMLDivElement>,
) => JSX.Element;

export default SelectableTextCell;
