/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  const { setIsUploadDialogOpen } = useHandleUploadFileStore();

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
