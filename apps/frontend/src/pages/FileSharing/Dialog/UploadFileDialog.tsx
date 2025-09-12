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
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ContentType from '@libs/filesharing/types/contentType';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const UploadFileDialog = () => {
  const { currentPath } = useFileSharingStore();
  const { isUploadDialogOpen, closeUploadDialog, uploadFiles, isUploading, setFilesToUpload } =
    useHandelUploadFileStore();

  const [remountKey, setRemountKey] = React.useState(0);

  const handleClose = () => {
    setFilesToUpload([]);
    setRemountKey((k) => k + 1);
    closeUploadDialog();
  };

  const handleSubmit = async () => {
    const results = await uploadFiles({
      endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
      type: ContentType.FILE,
      destinationPath: currentPath,
      parallel: true,
    });
    const hasError = results.some((r) => !r.ok);
    if (!hasError) handleClose();
  };

  return (
    <AdaptiveDialog
      isOpen={isUploadDialogOpen}
      handleOpenChange={handleClose}
      title="filesharingUpload.title"
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
