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
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';

interface DeletePublicFileDialogProps {
  trigger?: React.ReactNode;
}

const DeletePublicShareDialog: React.FC<DeletePublicFileDialogProps> = ({ trigger }) => {
  const { isLoading, deleteShares, shares, selectedRows, setSelectedRows, closeDialog, dialog } = usePublicShareStore();

  const sharesToDelete = shares.filter((share) => Object.keys(selectedRows).includes(share.publicShareId));

  const handleClose = () => closeDialog(PUBLIC_SHARE_DIALOG_NAMES.DELETE);

  const handleConfirmDelete = async () => {
    await deleteShares(sharesToDelete);
    setSelectedRows({});
    handleClose();
  };

  return (
    <DeleteConfirmationDialog
      isOpen={dialog.delete}
      onOpenChange={() => handleClose()}
      items={sharesToDelete.map(({ publicShareId, filename }) => ({ id: publicShareId, name: filename }))}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
      titleTranslationKey="filesharing.publicFileSharing.deleteFileLinks"
      messageTranslationKey="filesharing.publicFileSharing.confirmDelete"
      trigger={trigger}
      autoCloseOnSuccess={false}
    />
  );
};

export default DeletePublicShareDialog;
