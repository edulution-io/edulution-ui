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
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

const DeleteAiServiceDialog = () => {
  const {
    selectedAiService,
    setSelectedAiService,
    deleteAiService,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleteDialogLoading,
    fetchTableContent,
    error,
  } = useAiServiceTableStore();

  if (!selectedAiService) return null;

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedAiService(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAiService.id) return;
    await deleteAiService(selectedAiService.id);
    await fetchTableContent();
    handleClose();
  };

  return (
    <DeleteConfirmationDialog
      isOpen={isDeleteDialogOpen}
      onOpenChange={() => handleClose()}
      items={[{ id: selectedAiService.id || '', name: selectedAiService.name }]}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isDeleteDialogLoading}
      error={error}
      titleTranslationKey="settings.aiServices.deleteAiService"
      messageTranslationKey="settings.aiServices.confirmDelete"
      autoCloseOnSuccess={false}
    />
  );
};

export default DeleteAiServiceDialog;
