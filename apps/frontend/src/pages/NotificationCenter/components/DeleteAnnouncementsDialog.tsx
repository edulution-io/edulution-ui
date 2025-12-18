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

import React from 'react';
import useNotificationCenterStore from '@/pages/NotificationCenter/useNotificationCenterStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

const DeleteAnnouncementsDialog = () => {
  const {
    createdAnnouncements,
    selectedRows,
    setSelectedRows,
    setSelectedAnnouncement,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteAnnouncements,
    isDeleteDialogLoading,
    error,
  } = useNotificationCenterStore();

  const selectedRowIds = Object.keys(selectedRows).filter((key) => selectedRows[key]);

  const selectedItems = selectedRowIds
    .map((id) => {
      const announcement = createdAnnouncements.find((a) => a.id === id);
      return announcement ? { id: announcement.id, name: announcement.title } : null;
    })
    .filter((item): item is { id: string; name: string } => item !== null);

  if (selectedItems.length === 0) return null;

  const handleClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedAnnouncement(null);
    setSelectedRows({});
  };

  const handleConfirmDelete = async () => {
    await deleteAnnouncements(selectedRows);
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onOpenChange={handleClose}
      items={selectedItems}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isDeleteDialogLoading}
      error={error}
      titleTranslationKey="notificationCenter.deleteAnnouncements"
      messageTranslationKey="notificationCenter.confirmDeleteAnnouncements"
      autoCloseOnSuccess={false}
    />
  );
};

export default DeleteAnnouncementsDialog;
