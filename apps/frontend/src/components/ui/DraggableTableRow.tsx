/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
