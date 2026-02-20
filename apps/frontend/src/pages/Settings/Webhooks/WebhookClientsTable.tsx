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

import React, { useEffect, useMemo } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import type WebhookClientDto from '@libs/webhook/types/webhookClientDto';
import WEBHOOK_CLIENTS_TABLE_COLUMNS from '@libs/webhook/constants/webhookClientsTableColumns';
import APPS from '@libs/appconfig/constants/apps';
import TableAction from '@libs/common/types/tableAction';
import { AddIcon, DeleteIcon } from '@libs/common/constants/standardActionIcons';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useWebhookClientsStore from './useWebhookClientsStore';
import webhookClientsTableColumns from './webhookClientsTableColumns';
import AddWebhookClientDialog from './AddWebhookClientDialog';
import DeleteWebhookClientsDialog from './DeleteWebhookClientsDialog';

const WebhookClientsTable: React.FC = () => {
  const { isLoading, clients, selectedRows, setSelectedRows, setIsAddDialogOpen, setIsDeleteDialogOpen, fetchClients } =
    useWebhookClientsStore();

  const hasSelectedRows = Object.values(selectedRows).some(Boolean);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const actions: TableAction<WebhookClientDto>[] = useMemo(
    () => [
      {
        icon: AddIcon,
        translationId: 'settings.webhooks.addClient',
        onClick: () => setIsAddDialogOpen(true),
      },
      {
        icon: DeleteIcon,
        translationId: 'settings.webhooks.deleteClient',
        onClick: () => setIsDeleteDialogOpen(true),
        disabled: !hasSelectedRows,
      },
    ],
    [hasSelectedRows, setIsAddDialogOpen, setIsDeleteDialogOpen],
  );

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  return (
    <>
      <div className="relative">
        {isLoading && (
          <div className="absolute right-0 top-0">
            <CircleLoader />
          </div>
        )}
        <ScrollableTable
          columns={webhookClientsTableColumns}
          data={clients}
          filterKey={WEBHOOK_CLIENTS_TABLE_COLUMNS.USER_AGENT}
          filterPlaceHolderText="settings.webhooks.filterPlaceholder"
          onRowSelectionChange={handleRowSelectionChange}
          selectedRows={selectedRows}
          getRowId={(originalRow) => originalRow.id}
          applicationName={APPS.SETTINGS}
          actions={actions}
        />
      </div>
      <AddWebhookClientDialog />
      <DeleteWebhookClientsDialog />
    </>
  );
};

export default WebhookClientsTable;
