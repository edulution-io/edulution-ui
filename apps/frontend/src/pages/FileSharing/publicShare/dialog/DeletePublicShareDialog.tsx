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

import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';
import React from 'react';
import { t } from 'i18next';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

interface DeletePublicFileDialogProps {
  trigger?: React.ReactNode;
}

const DeletePublicShareDialog: React.FC<DeletePublicFileDialogProps> = ({ trigger }) => {
  const { isLoading, deleteShares, shares, selectedRows, setSelectedRows, closeDialog, dialog } = usePublicShareStore();

  const sharesToDelete = shares.filter((share) => Object.keys(selectedRows).includes(share.publicShareId));
  const isMultiDelete = sharesToDelete.length > 1;

  const handleClose = () => closeDialog(PUBLIC_SHARE_DIALOG_NAMES.DELETE);

  const onSubmit = async () => {
    await deleteShares(sharesToDelete);
    setSelectedRows({});
    handleClose();
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;

    return (
      <div className="text-background">
        <ItemDialogList
          deleteWarningTranslationId={
            isMultiDelete
              ? 'filesharing.publicFileSharing.confirmMultiDelete'
              : 'filesharing.publicFileSharing.confirmSingleDelete'
          }
          items={sharesToDelete.map(({ publicShareId, filename }) => ({
            name: filename,
            id: publicShareId,
          }))}
        />
      </div>
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={dialog.delete}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(
        isMultiDelete
          ? 'filesharing.publicFileSharing.deleteFileLinks'
          : 'filesharing.publicFileSharing.deleteFileLink',
        {
          count: sharesToDelete.length,
        },
      )}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeletePublicShareDialog;
