/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
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
