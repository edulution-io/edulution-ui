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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import DndTimeWindow from '@libs/notification/types/dndTimeWindow';
import DND_TIME_WINDOW_TABLE_COLUMNS from '@libs/notification/constants/dndTimeWindowTableColumns';
import useTableActions from '@/hooks/useTableActions';
import useNotificationSettingsStore from '@/pages/UserSettings/Notifications/useNotificationSettingsStore';
import DndTimeWindowsTableColumns from './DndTimeWindowsTableColumns';
import AddDndTimeWindowDialog from './AddDndTimeWindowDialog';
import DeleteDndTimeWindowDialog from './DeleteDndTimeWindowDialog';

interface AddDialogState {
  isOpen: boolean;
  editingTimeWindow: DndTimeWindow | null;
}

const DndTimeWindowsSettings: React.FC = () => {
  const { t } = useTranslation();
  const { notificationSettings, isLoading, getNotificationSettings, updateNotificationSettings } =
    useNotificationSettingsStore();

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});
  const [addDialogState, setAddDialogState] = useState<AddDialogState>({
    isOpen: false,
    editingTimeWindow: null,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const dndTimeWindows = notificationSettings?.dndTimeWindows ?? [];

  useEffect(() => {
    void getNotificationSettings();
  }, []);

  const getSelectedTimeWindow = (): DndTimeWindow | null => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([rowId]) => rowId);

    if (selectedIds.length === 1) {
      return dndTimeWindows.find((w) => w.id === selectedIds[0]) ?? null;
    }
    return null;
  };

  const handleAddClick = () => {
    const timeWindow = getSelectedTimeWindow();
    // Setze beide Werte gleichzeitig in einem State-Update
    setAddDialogState({
      isOpen: true,
      editingTimeWindow: timeWindow,
    });
  };

  const handleRemoveClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationSettings) return;

    const idsToDelete = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([rowId]) => rowId);

    const updatedWindows = dndTimeWindows.filter((w) => !idsToDelete.includes(w.id));

    await updateNotificationSettings({
      ...notificationSettings,
      dndTimeWindows: updatedWindows,
    });

    setSelectedRows({});
  };

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const handleDialogClose = () => {
    setAddDialogState({
      isOpen: false,
      editingTimeWindow: null,
    });
    setSelectedRows({});
  };

  const selectedRowsArray = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => {
          const timeWindow = dndTimeWindows.find((w) => w.id === rowId);
          return { original: timeWindow } as Row<DndTimeWindow>;
        })
        .filter((row) => row.original),
    [selectedRows, dndTimeWindows],
  );

  const actionsConfig = useMemo<TableActionsConfig<DndTimeWindow>>(
    () => [
      {
        type: STANDARD_ACTION_TYPES.ADD_OR_EDIT,
        onClick: handleAddClick,
      },
      {
        type: STANDARD_ACTION_TYPES.DELETE,
        onClick: handleRemoveClick,
        visible: ({ hasSelection }) => hasSelection,
      },
    ],
    [selectedRows, dndTimeWindows],
  );

  const tableActions = useTableActions(actionsConfig, selectedRowsArray);

  const selectedTimeWindows = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => dndTimeWindows.find((w) => w.id === rowId))
        .filter((w): w is DndTimeWindow => w !== undefined),
    [selectedRows, dndTimeWindows],
  );

  // Nicht anzeigen wenn Push-Notifications deaktiviert sind
  if (notificationSettings && !notificationSettings.pushEnabled) {
    return <div className="my-4 text-gray-400">{t('usersettings.notifications.enablePushFirst')}</div>;
  }

  return (
    <>
      <div>
        <p>{t('usersettings.notifications.dnd.description')}</p>
        <div>
          <ScrollableTable
            columns={DndTimeWindowsTableColumns}
            data={dndTimeWindows}
            filterKey={DND_TIME_WINDOW_TABLE_COLUMNS.LABEL}
            filterPlaceHolderText="usersettings.notifications.dnd.filterPlaceholder"
            applicationName={APPS.USER_SETTINGS}
            enableRowSelection
            onRowSelectionChange={handleRowSelectionChange}
            selectedRows={selectedRows}
            isLoading={isLoading}
            actions={tableActions}
            getRowId={(row) => row.id}
          />
        </div>
      </div>
      {addDialogState.isOpen && (
        <AddDndTimeWindowDialog
          isOpen
          editingTimeWindow={addDialogState.editingTimeWindow}
          handleOpenChange={handleDialogClose}
        />
      )}
      <DeleteDndTimeWindowDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedTimeWindows={selectedTimeWindows}
        onConfirmDelete={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  );
};

export default DndTimeWindowsSettings;
