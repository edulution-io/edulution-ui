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
import { MdFilePresent } from 'react-icons/md';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FileTypesConfiguration from '@libs/filesharing/constants/fileTypesConfiguration';
import UploadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/uploadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        variant: 'dropdown',
        icon: MdFilePresent,
        text: t('tooltip.create.file'),
        onClick: () => openDialog(FileActionType.CREATE_FILE),
        options: FileTypesConfiguration,
        onSelectFileSelect: setSelectedFileType,
      },
      {
        icon: HiOutlineFolderAdd,
        text: t('tooltip.create.folder'),
        onClick: () => openDialog(FileActionType.CREATE_FOLDER),
      },
      UploadButton(() => openDialog(FileActionType.UPLOAD_FILE)),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default FileActionNonSelect;
