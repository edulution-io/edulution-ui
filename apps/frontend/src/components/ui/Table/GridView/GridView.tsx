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

import React, { ReactNode, useEffect } from 'react';
import { Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import DraggableGridItem from './DraggableGridItem';

export interface GridItemConfig<TData> {
  renderIcon: (item: TData) => ReactNode;
  renderTitle: (item: TData) => string;
  renderSubtitle?: (item: TData) => string | undefined;
  onItemClick?: (item: TData) => void;
  renderContextMenu?: (item: TData) => ReactNode;
}

interface GridViewProps<TData> {
  rows: Row<TData>[];
  gridItemConfig: GridItemConfig<TData>;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  getRowDisabled?: (row: Row<TData>) => boolean;
  enableDragAndDrop?: boolean;
  canDropOnRow?: (row: TData) => boolean;
  focusedRowId?: string | null;
  onItemClick?: (item: TData) => void;
  onRowsChange?: (data: TData[]) => void;
}

const GridView = <TData,>({
  rows,
  gridItemConfig,
  enableRowSelection,
  getRowDisabled,
  enableDragAndDrop = false,
  canDropOnRow,
  focusedRowId,
  onItemClick,
  onRowsChange,
}: GridViewProps<TData>) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (onRowsChange) {
      onRowsChange(rows.map((row) => row.original));
    }
  }, [rows, onRowsChange]);

  const isRowSelectionEnabled = (row: Row<TData>): boolean => {
    if (typeof enableRowSelection === 'function') {
      return enableRowSelection(row);
    }
    return enableRowSelection !== false;
  };

  if (rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-muted-foreground">{t('table.noDataAvailable')}</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 px-1 pb-6">
      {rows.map((row) => {
        const isDisabled = getRowDisabled?.(row) ?? false;
        const canSelect = isRowSelectionEnabled(row);

        return (
          <DraggableGridItem
            key={row.id}
            row={row}
            isDisabled={isDisabled}
            renderIcon={gridItemConfig.renderIcon}
            renderTitle={gridItemConfig.renderTitle}
            renderSubtitle={gridItemConfig.renderSubtitle}
            onItemClick={onItemClick ?? gridItemConfig.onItemClick}
            renderContextMenu={gridItemConfig.renderContextMenu}
            enableRowSelection={canSelect}
            enableDragAndDrop={enableDragAndDrop}
            canDropOnRow={canDropOnRow}
            isKeyboardFocused={focusedRowId === row.id}
          />
        );
      })}
    </div>
  );
};

export default GridView;
