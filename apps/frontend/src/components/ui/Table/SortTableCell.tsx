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
        className={`ml-4 ${isDisabledUp ? 'text-foreground' : 'text-muted-foreground'}`}
      >
        <IoArrowUpOutline />
      </button>
      <button
        type="button"
        onClick={moveDown}
        disabled={isDisabledDown}
        className={`${isDisabledDown ? 'text-foreground' : 'text-muted-foreground'} ml-4`}
      >
        <IoArrowDownOutline />
      </button>
    </SelectableCell>
  );
};

export default SortTableCell;
