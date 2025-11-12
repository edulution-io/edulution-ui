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
import React, { ReactNode, useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { TableRow } from '@/components/ui/Table';
import { Row } from '@tanstack/react-table';

interface DraggableRowProps<TData> {
  row: Row<TData>;
  children: ReactNode;
  isRowDisabled?: boolean;
  enableDragAndDrop: boolean;
  canDropOnRow?: (row: TData) => boolean;
  textColorClassname: string;
}

const DraggableTableRow = <TData,>({
  row,
  children,
  isRowDisabled,
  enableDragAndDrop,
  canDropOnRow,
}: DraggableRowProps<TData>) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: row.id,
    data: row.original as Record<string, unknown>,
    disabled: !enableDragAndDrop || isRowDisabled,
  });

  const canDrop = canDropOnRow?.(row.original) ?? false;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: row.id,
    disabled: !enableDragAndDrop || !canDrop,
    data: row.original as Record<string, unknown>,
  });

  const combinedRef = useCallback(
    (element: HTMLTableRowElement | null) => {
      setDragRef(element);
      setDropRef(element);
    },
    [setDragRef, setDropRef],
  );

  const isSelected = row.getIsSelected();

  return (
    <TableRow
      ref={combinedRef}
      data-state={isSelected ? 'selected' : undefined}
      data-disabled={isRowDisabled ? 'true' : undefined}
      className={`
        ${isRowDisabled ? 'pointer-events-none cursor-not-allowed opacity-50 saturate-0' : ''}
        ${enableDragAndDrop && !isRowDisabled ? 'cursor-move' : ''}
        ${isDragging ? 'opacity-30' : ''}
        ${isDragging && isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isOver && canDrop ? 'bg-primary/10 ring-2 ring-inset ring-primary' : ''}
      `}
      style={{ transition: 'all 0.2s ease' }}
      {...listeners}
      {...attributes}
    >
      {children}
    </TableRow>
  );
};

export default DraggableTableRow;
