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

import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import FileSelectorDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/FileSelectorDialogBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Button } from '@/components/shared/Button';

const FileSelectorDialog = () => {
  const { isFileDialogOpen, setAllowedExtensions, setOpenFileDialog } = useOpenFileDialogStore();
  const { moveOrCopyItemToPath, setMoveOrCopyItemToPath } = useFileSharingDialogStore();
  const { createDownloadBlobUrl } = useFileSharingDownloadStore();
  const { openTldrFromBlobUrl } = useWhiteboardEditorStore();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileDialog = () => fileInputRef.current?.click();

  const handleClose = () => {
    setAllowedExtensions([]);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setOpenFileDialog(false);
  };

  const handleLocalImport = async (file: File) => {
    const blobUrl = URL.createObjectURL(file);

    try {
      await openTldrFromBlobUrl(blobUrl, file.name);
      setOpenFileDialog(false);
    } catch (err) {
      setOpenFileDialog(false);
    }
  };

  const handelSubmit = async () => {
    const cleanedPath = getPathWithoutWebdav(moveOrCopyItemToPath.filePath);
    const blobUrl = await createDownloadBlobUrl(cleanedPath);
    if (blobUrl) {
      await openTldrFromBlobUrl(blobUrl, moveOrCopyItemToPath.filename);
    }
    handleClose();
    return [];
  };

  const getFooter = () => (
    <div className="flex w-full items-center">
      <div>
        <Button onClick={triggerFileDialog}>Lokale .tldr importieren</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".tldr"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleLocalImport(file);
          }}
        />
      </div>

      <div className="ml-auto">
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handelSubmit}
          submitButtonText="common.open"
          submitButtonType="submit"
          disableSubmit={!moveOrCopyItemToPath?.filePath}
        />
      </div>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isFileDialogOpen}
      title={t('fileSelectorDialogBody.title')}
      body={<FileSelectorDialogBody />}
      footer={getFooter()}
      handleOpenChange={handleClose}
    />
  );
};

export default FileSelectorDialog;
