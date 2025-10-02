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

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';
import UploadFolderFile from '@libs/filesharing/types/uploadFolderFile';
import UploadFolder from '@libs/filesharing/types/uploadFolder';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import { UploadItem } from '@libs/filesharing/types/uploadItem';

const UploadFileDialog = () => {
  const { webdavShare } = useParams();
  const { currentPath } = useFileSharingStore();
  const {
    isUploadDialogOpen,
    closeUploadDialog,
    uploadFiles,
    isUploading,
    setFilesToUpload,
    filesToUpload,
    uploadFolders,
    setFolders,
  } = useHandelUploadFileStore();

  const { eduApiToken } = useUserStore();
  const { t } = useTranslation();
  const [remountKey, setRemountKey] = useState(0);

  const handleClose = () => {
    setFilesToUpload([]);
    setRemountKey((k) => k + 1);
    closeUploadDialog();
  };

  const mapUploadFolderFileToFolder = (uploadFolderFile: UploadFolderFile): UploadFolder => ({
    id: uploadFolderFile.name,
    name: uploadFolderFile.originalFolderName ?? uploadFolderFile.name,
    path: uploadFolderFile.name,
    files: uploadFolderFile.containedFiles ?? [],
    subfolders:
      (uploadFolderFile.containedSubfolders as UploadFolderFile[] | undefined)?.map(mapUploadFolderFileToFolder) ?? [],
  });

  const isFolderItem = (x: UploadItem): x is UploadFolderFile => (x as UploadFolderFile).isZippedFolder === true;

  const isFileItem = (x: UploadItem): x is UploadFile => !(x as UploadFolderFile).isZippedFolder;

  const handleSubmit = async () => {
    closeUploadDialog();

    const filesOnly = filesToUpload.filter(isFileItem);
    const foldersOnly = filesToUpload.filter(isFolderItem);

    if (foldersOnly.length > 0) {
      const folderTrees = foldersOnly.map((f) => mapUploadFolderFileToFolder(f));
      setFolders(folderTrees);

      await uploadFolders(currentPath, eduApiToken, webdavShare);
    }

    if (filesOnly.length > 0) {
      setFilesToUpload(filesOnly);
      await uploadFiles(currentPath, eduApiToken, webdavShare);
    }

    setRemountKey((k) => k + 1);
  };

  return (
    <AdaptiveDialog
      isOpen={isUploadDialogOpen}
      handleOpenChange={handleClose}
      title={t('filesharingUpload.title')}
      body={<UploadContentBody key={remountKey} />}
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          submitButtonType="submit"
          submitButtonText="filesharingUpload.upload"
          disableSubmit={isUploading}
        />
      }
    />
  );
};

export default UploadFileDialog;
