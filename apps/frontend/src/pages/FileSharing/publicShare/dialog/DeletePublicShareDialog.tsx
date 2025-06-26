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
  const {
    selectedContentToShareRows,
    isLoading,
    isPublicShareDeleteDialogOpen,
    deletePublicShares,
    setIsPublicShareDeleteDialogOpen,
  } = usePublicShareStore();

  const isMultiDelete = selectedContentToShareRows.length > 1;

  const onSubmit = async () => {
    await deletePublicShares(selectedContentToShareRows);
    setIsPublicShareDeleteDialogOpen(false);
  };

  const handleClose = () => setIsPublicShareDeleteDialogOpen(false);

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
          items={selectedContentToShareRows.map(({ publicShareId, filename }) => ({
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
      isOpen={isPublicShareDeleteDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(
        isMultiDelete
          ? 'filesharing.publicFileSharing.deleteFileLinks'
          : 'filesharing.publicFileSharing.deleteFileLink',
        {
          count: selectedContentToShareRows.length,
        },
      )}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeletePublicShareDialog;
