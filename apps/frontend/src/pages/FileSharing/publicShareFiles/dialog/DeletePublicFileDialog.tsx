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

import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';
import React from 'react';
import { t } from 'i18next';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface DeletePublicFileDialogProps {
  trigger?: React.ReactNode;
}

const DeletePublicFileDialog: React.FC<DeletePublicFileDialogProps> = ({ trigger }) => {
  const {
    selectedFilesToShareRows,
    isLoading,
    isShareFileDeleteDialogOpen,
    deletePublicShareFiles,
    setIsShareFileDeleteDialogOpen,
  } = usePublicShareFilesStore();

  const isMultiDelete = selectedFilesToShareRows.length > 1;

  const onSubmit = async () => {
    await deletePublicShareFiles(selectedFilesToShareRows);
    setIsShareFileDeleteDialogOpen(false);
  };

  const handleClose = () => setIsShareFileDeleteDialogOpen(false);

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
          items={selectedFilesToShareRows.map(({ _id: id, filename }) => ({
            name: filename,
            id,
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
      isOpen={isShareFileDeleteDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(
        isMultiDelete
          ? 'filesharing.publicFileSharing.deleteFileLinks'
          : 'filesharing.publicFileSharing.deleteFileLink',
        {
          count: selectedFilesToShareRows.length,
        },
      )}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeletePublicFileDialog;
