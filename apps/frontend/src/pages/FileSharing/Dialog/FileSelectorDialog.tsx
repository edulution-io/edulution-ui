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
import React from 'react';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ContentType from '@libs/filesharing/types/contentType';

const FileSelectorDialog = () => {
  const { isFileDialogOpen, setAllowedExtensions, setOpenFileDialog } = useOpenFileDialogStore();
  const { moveOrCopyItemToPath, setMoveOrCopyItemToPath } = useFileSharingDialogStore();
  const { createDownloadBlobUrl } = useFileSharingDownloadStore();
  const { openTldrFromBlobUrl } = useWhiteboardEditorStore();
  const { t } = useTranslation();
  const { selectedWebdavShare } = useFileSharingStore();
  const { allowedExtensions } = useOpenFileDialogStore();

  const fileHasAllowedExtension = (name: string) =>
    !allowedExtensions.length || allowedExtensions.some((ext) => name.toLowerCase().endsWith(ext.toLowerCase()));

  const handleClose = () => {
    setAllowedExtensions([]);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setOpenFileDialog(false);
  };

  const handelSubmit = async () => {
    const blobUrl = await createDownloadBlobUrl(moveOrCopyItemToPath.filePath, selectedWebdavShare);
    if (blobUrl) {
      await openTldrFromBlobUrl(blobUrl, moveOrCopyItemToPath.filename);
    }
    handleClose();
    return [];
  };

  const getDialog = () => (
      <MoveContentDialogBody
        showAllFiles
        pathToFetch=""
        showSelectedFile
        fileType={ContentType.FILE}
        enableRowSelection={(row) =>
          row.original.type === ContentType.FILE && fileHasAllowedExtension(row.original.filename)
        }
        getRowDisabled={(row) =>
          row.original.type === ContentType.FILE && !fileHasAllowedExtension(row.original.filename)
        }
      />
    );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handelSubmit}
      submitButtonText="common.open"
      submitButtonType="submit"
      disableSubmit={!moveOrCopyItemToPath?.filePath}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isFileDialogOpen}
      title={t('fileSelectorDialogBody.title')}
      body={getDialog()}
      footer={getFooter()}
      handleOpenChange={handleClose}
    />
  );
};

export default FileSelectorDialog;
