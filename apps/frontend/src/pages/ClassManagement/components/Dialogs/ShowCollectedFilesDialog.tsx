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
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const ShowCollectedFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose }) => {
  const { homePath } = useUserPath();
  const navigate = useNavigate();
  const collectedFilesPath = `${homePath}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}`;

  const getDialogBody = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={collectedFilesPath}
      showSelectedFile={false}
      showRootOnly
    />
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={() => {
        navigate(`/filesharing?path=${collectedFilesPath}`);
      }}
      submitButtonText={`classmanagement.${title}`}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ShowCollectedFilesDialog;
