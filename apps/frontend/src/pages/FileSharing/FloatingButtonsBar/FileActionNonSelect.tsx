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

import React, { FC, useState, useMemo } from 'react';
import { t } from 'i18next';
import { IconType } from 'react-icons';
import { MdFilePresent } from 'react-icons/md';
import { HiOutlineFolderAdd, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { SiDiagramsdotnet, SiMarkdown, SiJavascript, SiPython, SiYaml } from 'react-icons/si';
import {
  FaFileAlt,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileWord,
  FaFileCode,
  FaCog,
  FaHtml5,
  FaCss3Alt,
  FaFileCsv,
  FaTerminal,
  FaFile,
} from 'react-icons/fa';
import { VscJson } from 'react-icons/vsc';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import UploadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/uploadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import type FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import type FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import AVAILABLE_FILE_TYPES from '@libs/filesharing/constants/availableFileTypes';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import PREDEFINED_EXTENSIONS, { PredefinedExtensionKey } from '@libs/filesharing/constants/predefinedExtensions';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';

const EXTENSION_ICON_MAP: Record<PredefinedExtensionKey, { icon: IconType; iconColor: string }> = {
  json: { icon: VscJson, iconColor: '#f5a623' },
  yaml: { icon: SiYaml, iconColor: '#cb171e' },
  yml: { icon: SiYaml, iconColor: '#cb171e' },
  toml: { icon: FaFileAlt, iconColor: '#9c4121' },
  xml: { icon: FaFileCode, iconColor: '#f26522' },
  cfg: { icon: FaCog, iconColor: '#6c757d' },
  ini: { icon: FaCog, iconColor: '#6c757d' },
  env: { icon: FaCog, iconColor: '#6c757d' },
  md: { icon: SiMarkdown, iconColor: '#083fa1' },
  html: { icon: FaHtml5, iconColor: '#e34f26' },
  css: { icon: FaCss3Alt, iconColor: '#1572b6' },
  csv: { icon: FaFileCsv, iconColor: '#217346' },
  sh: { icon: FaTerminal, iconColor: '#4eaa25' },
  bat: { icon: FaTerminal, iconColor: '#4eaa25' },
  ps1: { icon: FaTerminal, iconColor: '#5391fe' },
  py: { icon: SiPython, iconColor: '#3776ab' },
  js: { icon: SiJavascript, iconColor: '#f7df1e' },
};

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

  const documentFileTypes: DropdownMenuItemType[] = useMemo(
    () => [
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
    ],
    [],
  );

  const predefinedExtensionItems: DropdownMenuItemType[] = useMemo(() => {
    const sortedExtensions = (Object.keys(PREDEFINED_EXTENSIONS) as PredefinedExtensionKey[]).sort((a, b) =>
      a.localeCompare(b),
    );
    return sortedExtensions.map((ext) => {
      const iconConfig = EXTENSION_ICON_MAP[ext];
      return {
        label: t(`fileCreateNewContent.newFileFromType.${ext}`, `.${ext}`),
        icon: iconConfig.icon,
        iconColor: iconConfig.iconColor,
        onClick: () => handleSelectPredefinedExtension(ext),
      };
    });
  }, []);

  const customFileItem = {
    label: t('fileCreateNewContent.newFileFromType.customFile'),
    icon: FaFile,
    iconColor: '#6c757d',
    onClick: handleSelectCustomExtension,
  };

  const expandToggleItem = {
    label: isExpanded ? t('fileCreateNewContent.lessFileTypes') : t('fileCreateNewContent.moreFileTypes'),
    icon: isExpanded ? HiChevronUp : HiChevronDown,
    iconColor: '#6c757d',
    onClick: () => setIsExpanded(!isExpanded),
    preventClose: true,
  };

  const fileTypesConfiguration: DropdownMenuItemType[] = useMemo(() => {
    const items: DropdownMenuItemType[] = [...documentFileTypes, customFileItem];
    if (isExpanded) {
      items.push({ label: 'separator1', isSeparator: true });
      items.push(...predefinedExtensionItems);
    }
    items.push({ label: 'separator2', isSeparator: true });
    items.push(expandToggleItem);
    return items;
  }, [isExpanded, predefinedExtensionItems, documentFileTypes, customFileItem, expandToggleItem]);

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
