/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';
import React from 'react';
import { t } from 'i18next';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface DeletePublicFileDialogProps {
  trigger?: React.ReactNode;
}

const DeletePublicShareDialog: React.FC<DeletePublicFileDialogProps> = ({ trigger }) => {
  const { isLoading, deleteShares, shares, selectedRows, setSelectedRows, closeDialog, dialog } = usePublicShareStore();

  const sharesToDelete = shares.filter((share) => Object.keys(selectedRows).includes(share.publicShareId));
  const isMultiDelete = sharesToDelete.length > 1;

  const handleClose = () => closeDialog('delete');

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
