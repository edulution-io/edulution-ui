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
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface DeleteConferencesDialogProps {
  trigger?: React.ReactNode;
}

const DeleteConferencesDialog = ({ trigger }: DeleteConferencesDialogProps) => {
  const {
    selectedRows,
    isLoading,
    error,
    deleteConferences,
    conferences,
    isDeleteConferencesDialogOpen,
    setIsDeleteConferencesDialogOpen,
  } = useConferenceStore();

  const selectedConferenceIds = Object.keys(selectedRows);
  const selectedConferences = conferences.filter((c) => selectedConferenceIds.includes(c.meetingID));

  const handleConfirmDelete = async () => {
    await deleteConferences(selectedConferences);
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isDeleteConferencesDialogOpen}
      onOpenChange={setIsDeleteConferencesDialogOpen}
      items={selectedConferences.map((c) => ({ id: c.meetingID, name: c.name }))}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
      error={error}
      titleTranslationKey="conferences.deleteConferences"
      messageTranslationKey="conferences.confirmDelete"
      trigger={trigger}
    />
  );
};

export default DeleteConferencesDialog;
