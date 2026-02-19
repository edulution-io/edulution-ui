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

import React, { useMemo } from 'react';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import useWebhookClientsStore from './useWebhookClientsStore';

const DeleteWebhookClientsDialog: React.FC = () => {
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, clients, selectedRows, deleteClients, isLoading } =
    useWebhookClientsStore();

  const selectedItems = useMemo(
    () =>
      Object.keys(selectedRows)
        .filter((key) => selectedRows[key])
        .map((id) => {
          const client = clients.find((c) => c.id === id);
          return { id, name: client?.userAgent ?? id };
        }),
    [selectedRows, clients],
  );

  const handleConfirmDelete = async () => {
    const ids = selectedItems.map((item) => item.id);
    await deleteClients(ids);
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      items={selectedItems}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
      titleTranslationKey="settings.webhooks.deleteClient"
      messageTranslationKey="settings.webhooks.deleteConfirmMessage"
    />
  );
};

export default DeleteWebhookClientsDialog;
