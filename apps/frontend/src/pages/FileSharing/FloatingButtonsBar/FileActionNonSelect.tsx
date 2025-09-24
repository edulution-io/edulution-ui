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
import { SiDiagramsdotnet } from 'react-icons/si';
import { FaFileAlt, FaFileExcel, FaFilePowerpoint, FaFileWord } from 'react-icons/fa';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import UploadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/uploadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import type FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  const { setIsUploadDialogOpen } = useHandelUploadFileStore();

  const handleSelectCreateFile = (fileType: TAvailableFileTypes) => {
    setSelectedFileType(fileType);
    openDialog(FileActionType.CREATE_FILE);
  };

  const fileTypesConfiguration = [
    {
      label: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.drawIoFile}`),
      icon: SiDiagramsdotnet,
      iconColor: 'orange',
      onClick: () => handleSelectCreateFile(AVAILABLE_FILE_TYPES.drawIoFile),
    },
    {
      label: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.textFile}`),
      icon: FaFileAlt,
      iconColor: 'black',
      onClick: () => handleSelectCreateFile(AVAILABLE_FILE_TYPES.textFile),
    },
    {
      label: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.documentFile}`),
      icon: FaFileWord,
      iconColor: 'blue',
      onClick: () => handleSelectCreateFile(AVAILABLE_FILE_TYPES.documentFile),
    },
    {
      label: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.spreadsheetFile}`),
      icon: FaFileExcel,
      iconColor: 'green',
      onClick: () => handleSelectCreateFile(AVAILABLE_FILE_TYPES.spreadsheetFile),
    },
    {
      label: t(`fileCreateNewContent.newFileFromType.${AVAILABLE_FILE_TYPES.presentationFile}`),
      icon: FaFilePowerpoint,
      iconColor: '#ec4f03',
      onClick: () => handleSelectCreateFile(AVAILABLE_FILE_TYPES.presentationFile),
    },
  ];

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        variant: 'dropdown',
        icon: MdFilePresent,
        text: t('tooltip.create.file'),
        dropdownItems: fileTypesConfiguration,
      },
      {
        icon: HiOutlineFolderAdd,
        text: t('tooltip.create.folder'),
        onClick: () => openDialog(FileActionType.CREATE_FOLDER),
      },
      UploadButton(() => setIsUploadDialogOpen(true)),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default FileActionNonSelect;
