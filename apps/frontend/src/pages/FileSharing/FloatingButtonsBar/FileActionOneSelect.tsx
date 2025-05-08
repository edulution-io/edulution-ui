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

import React, { FC } from 'react';
import { t } from 'i18next';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import ContentType from '@libs/filesharing/types/contentType';
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import MAX_FILE_UPLOAD_SIZE from '@libs/ui/constants/maxFileUploadSize';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import DownloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/downloadButton';
import MoveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/moveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';

const FileActionOneSelect: FC<FileActionButtonProps> = ({ openDialog, selectedItem }) => {
  const { downloadFile } = useFileSharingDownloadStore();

  const startDownload = async (filePath: string, filename: string) => {
    const downloadLinkURL = await downloadFile(filePath);
    if (!downloadLinkURL) return;
    const link = document.createElement('a');
    link.href = downloadLinkURL;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadLinkURL);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => openDialog(FileActionType.DELETE_FILE_FOLDER)),
      MoveButton(() => openDialog(FileActionType.MOVE_FILE_FOLDER)),
      {
        icon: MdDriveFileRenameOutline,
        text: t('tooltip.rename'),
        onClick: () => openDialog(FileActionType.RENAME_FILE_FOLDER),
      },
      DownloadButton(
        selectedItem ? () => startDownload(selectedItem.filename, selectedItem.basename) : () => {},
        selectedItem?.type === ContentType.FILE && bytesToMegabytes(selectedItem?.size || 0) < MAX_FILE_UPLOAD_SIZE,
      ),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};
export default FileActionOneSelect;
