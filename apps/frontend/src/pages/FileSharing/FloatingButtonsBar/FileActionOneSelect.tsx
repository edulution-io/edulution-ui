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
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import MoveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/moveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import DownloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/downloadButton';
import useStartWebdavFileDownload from '@/pages/FileSharing/hooks/useStartWebdavFileDownload';
import CopyButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/copyButton';
import ShareButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/shareButton';

const FileActionOneSelect: FC<FileActionButtonProps> = ({ openDialog, selectedItems }) => {
  const startDownload = useStartWebdavFileDownload();

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => openDialog(FileActionType.DELETE_FILE_OR_FOLDER)),
      MoveButton(() => openDialog(FileActionType.MOVE_FILE_OR_FOLDER)),
      {
        icon: MdDriveFileRenameOutline,
        text: t('tooltip.rename'),
        onClick: () => openDialog(FileActionType.RENAME_FILE_OR_FOLDER),
      },
      DownloadButton(async () => {
        if (!selectedItems) return;
        await startDownload(selectedItems);
      }),
      CopyButton(() => openDialog(FileActionType.COPY_FILE_OR_FOLDER)),
      ShareButton(() => openDialog(FileActionType.SHARE_FILE_OR_FOLDER)),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};
export default FileActionOneSelect;
