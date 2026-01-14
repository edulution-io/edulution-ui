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

import React, { KeyboardEvent, ReactNode, useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Row } from '@tanstack/react-table';
import cn from '@libs/common/utils/className';
import Checkbox from '@/components/ui/Checkbox';
import { Card, CardContent } from '@/components/shared/Card/Card';
import { GRID_ITEM_WIDTH } from '@libs/ui/constants/tableGridSizes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

interface DraggableGridItemProps<TData> {
  row: Row<TData>;
  isDisabled?: boolean;
  renderIcon: (item: TData) => ReactNode;
  renderTitle: (item: TData) => string;
  renderSubtitle?: (item: TData) => string | undefined;
  onItemClick?: (item: TData) => void;
  renderContextMenu?: (item: TData) => ReactNode;
  enableRowSelection?: boolean;
  enableDragAndDrop?: boolean;
  canDropOnRow?: (row: TData) => boolean;
}

const DraggableGridItem = <TData,>({
  row,
  isDisabled = false,
  renderIcon,
  renderTitle,
  renderSubtitle,
  onItemClick,
  renderContextMenu,
  enableRowSelection = true,
  enableDragAndDrop = false,
  canDropOnRow,
}: DraggableGridItemProps<TData>) => {
  const item = row.original;
  const isSelected = row.getIsSelected();
  const title = renderTitle(item);
  const subtitle = renderSubtitle?.(item);

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: row.id,
    data: item as Record<string, unknown>,
    disabled: !enableDragAndDrop || isDisabled,
  });

  const canDrop = canDropOnRow?.(item) ?? false;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: row.id,
    disabled: !enableDragAndDrop || !canDrop,
    data: item as Record<string, unknown>,
  });

  const combinedRef = useCallback(
    (element: HTMLDivElement | null) => {
      setDragRef(element);
      setDropRef(element);
    },
    [setDragRef, setDropRef],
  );

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && onItemClick) {
      onItemClick(item);
    } else if (event.key === ' ' && enableRowSelection && !isDisabled) {
      event.preventDefault();
      row.toggleSelected();
    }
  };

  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isDisabled) {
      row.toggleSelected();
    }
  };

  return (
    <Card
      ref={combinedRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      variant={isSelected ? 'gridSelected' : 'grid'}
      className={cn(
        'group relative',
        isDisabled && 'opacity-50',
        isDragging && 'opacity-30',
        isDragging && isSelected && 'ring-2 ring-primary ring-offset-2',
        isOver && canDrop && 'bg-primary/10 ring-2 ring-inset ring-primary',
      )}
      style={{ width: GRID_ITEM_WIDTH }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex flex-col items-center p-4">
        {enableRowSelection && (
          <div className="absolute left-2 top-2">
            <Checkbox
              checked={isSelected}
              onCheckboxClick={handleCheckboxClick}
              disabled={isDisabled}
            />
          </div>
        )}

        {renderContextMenu && (
          <div
            className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            {renderContextMenu(item)}
          </div>
        )}

        <div className="flex h-16 w-16 items-center justify-center">{renderIcon(item)}</div>

        <div className="mt-2 w-full text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate text-sm font-medium">{title}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
          <p className="truncate text-xs text-muted-foreground">{subtitle ?? '\u00A0'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraggableGridItem;
