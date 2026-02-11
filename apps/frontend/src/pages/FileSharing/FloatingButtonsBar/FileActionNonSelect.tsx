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

import React, { FC, useState } from 'react';
import { t } from 'i18next';
import { faFile, faFileCirclePlus, faChevronDown, faChevronUp, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import UploadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/uploadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/frontend/ui/types/FloatingButtons/floatingButtonsBarConfig';
import type FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import { PredefinedExtensionKey } from '@libs/filesharing/constants/predefinedExtensions';
import DropdownMenuItemType from '@libs/frontend/ui/types/dropdownMenuItemType';
import EXTENSION_ICON_MAP from '@libs/frontend/filesharing/constants/extensionIconMap';
import DOCUMENT_FILE_TYPE_CONFIG from '@libs/frontend/filesharing/constants/documentFileTypeConfig';
import SORTED_PREDEFINED_EXTENSIONS from '@libs/filesharing/constants/sortedPredefinedExtensions';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType, setCustomExtension } = useFileSharingDialogStore();
  const { setIsUploadDialogOpen } = useHandleUploadFileStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectCreateFile = (fileType: TAvailableFileTypes) => {
    setSelectedFileType(fileType);
    setCustomExtension('');
    openDialog(FileActionType.CREATE_FILE);
  };

  const handleSelectPredefinedExtension = (extension: PredefinedExtensionKey) => {
    setSelectedFileType(AVAILABLE_FILE_TYPES.customFile);
    setCustomExtension(extension);
    openDialog(FileActionType.CREATE_FILE);
  };

  const handleSelectCustomExtension = () => {
    setSelectedFileType(AVAILABLE_FILE_TYPES.customFile);
    setCustomExtension('');
    openDialog(FileActionType.CREATE_FILE);
  };

  const documentFileTypes: DropdownMenuItemType[] = DOCUMENT_FILE_TYPE_CONFIG.map(({ fileType, icon, iconColor }) => ({
    label: t(`fileCreateNewContent.newFileFromType.${fileType}`),
    icon,
    iconColor,
    onClick: () => handleSelectCreateFile(fileType),
  }));

  const predefinedExtensionItems: DropdownMenuItemType[] = SORTED_PREDEFINED_EXTENSIONS.map((ext) => {
    const iconConfig = EXTENSION_ICON_MAP[ext];
    return {
      label: t(`fileCreateNewContent.newFileFromType.${ext}`, `.${ext}`),
      icon: iconConfig.icon,
      iconColor: iconConfig.iconColor,
      onClick: () => handleSelectPredefinedExtension(ext),
    };
  });

  const customFileItem = {
    label: t('fileCreateNewContent.newFileFromType.customFile'),
    icon: faFile,
    iconColor: '#848493',
    onClick: handleSelectCustomExtension,
  };

  const expandToggleItem = {
    label: isExpanded ? t('fileCreateNewContent.lessFileTypes') : t('fileCreateNewContent.moreFileTypes'),
    icon: isExpanded ? faChevronUp : faChevronDown,
    iconColor: '#848493',
    onClick: () => setIsExpanded(!isExpanded),
    preventClose: true,
  };

  const fileTypesConfiguration: DropdownMenuItemType[] = [
    ...documentFileTypes,
    customFileItem,
    ...(isExpanded ? [{ label: 'separator1', isSeparator: true }, ...predefinedExtensionItems] : []),
    { label: 'separator2', isSeparator: true },
    expandToggleItem,
  ];

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        variant: 'dropdown',
        icon: faFileCirclePlus,
        text: t('tooltip.create.file'),
        dropdownItems: fileTypesConfiguration,
      },
      {
        icon: faFolderPlus,
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
