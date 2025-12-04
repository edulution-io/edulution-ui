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

import { z } from 'zod';
import CreateOrRenameContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/CreateOrRenameContentDialogBody';
import DeleteContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/DeleteContentDialogBody';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import generateFile from '@/pages/FileSharing/utilities/generateFile';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { HttpMethods } from '@libs/common/types/http-methods';

import { FilesharingDialogProps, FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import ContentType from '@libs/filesharing/types/contentType';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogBodyProps';
import MoveDirectoryDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveDirectoryDialogBody';
import CopyContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/CopyContentDialogBody';
import PublicShareContentsDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/PublicShareContentsDialogBody';
import fileSharingFromSchema from '@libs/filesharing/types/fileSharingFromSchema';
import DialogInputValues from '@libs/filesharing/types/dialogInputValues';
import FILESHARING_SHARED_FILES_API_ENDPOINT from '@libs/filesharing/constants/filesharingSharedFilesApiEndpoint';
import { t } from 'i18next';
import stripTrailingSlash from '@libs/filesharing/utils/stripTrailingSlash';
import FileSelectorDialogProps from '@libs/filesharing/types/fileSelectorDialogProps';

interface DialogBodyConfigurationBase {
  schema?: z.ZodSchema<FileSharingFormValues>;
  isRenaming?: boolean;
  titleKey: string;
  submitKey: string;
  initialValues?: FileSharingFormValues;
  endpoint: string;
  type: ContentType;
  httpMethod: HttpMethods;
  componentProps?: Record<string, unknown>;
  hideSubmitButton?: boolean;
  desktopComponentClassName?: string;
  mobileComponentClassName?: string;
  getData?: (
    form: UseFormReturn<FileSharingFormValues>,
    currentPath: string,
    inputValues: DialogInputValues,
  ) => Promise<PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[]>;
  requiresForm?: boolean;
}

interface PlainDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType;
}

interface CreateFolderDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<FilesharingDialogProps>;
}
interface CreateFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<FilesharingDialogProps>;
}
interface RenameDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<FilesharingDialogProps>;
}
interface MoveDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<MoveContentDialogBodyProps>;
}

interface SaveExternalFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<FilesharingDialogProps>;
}

interface FileSelectorDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<FileSelectorDialogProps>;
}

type DialogBodyConfiguration =
  | CreateFolderDialogBodyConfiguration
  | CreateFileDialogBodyConfiguration
  | RenameDialogBodyConfiguration
  | MoveDialogBodyConfiguration
  | PlainDialogBodyConfiguration
  | SaveExternalFileDialogBodyConfiguration
  | FileSelectorDialogBodyConfiguration;

const initialFormValues = {
  filename: '',
  extension: '',
};

const createFolderConfig: CreateFolderDialogBodyConfiguration = {
  Component: CreateOrRenameContentDialogBody,
  titleKey: 'fileCreateNewContent.directoryDialogTitle',
  submitKey: 'fileCreateNewContent.createButtonText',
  initialValues: initialFormValues,
  schema: fileSharingFromSchema,
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.POST,
  type: ContentType.DIRECTORY,
  requiresForm: true,
  getData: (form, currentPath, _inputValues) => {
    const filename = form.getValues('filename');

    return Promise.resolve({
      path: currentPath,
      newPath: filename,
    });
  },
};

const createFileConfig: CreateFileDialogBodyConfiguration = {
  Component: CreateOrRenameContentDialogBody,
  schema: z.object({
    filename: z.string().min(1, t('filesharing.tooltips.FileNameRequired')),
    extension: z.string(),
  }),
  titleKey: 'fileCreateNewContent.fileDialogTitle',
  submitKey: 'fileCreateNewContent.createButtonText',
  initialValues: initialFormValues,
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
  httpMethod: HttpMethods.POST,
  type: ContentType.FILE,
  requiresForm: true,
  getData: async (form, currentPath, { documentVendor, selectedFileType }) => {
    const filename = form.getValues('filename');

    const { file, extension } = await generateFile(selectedFileType, filename, documentVendor);

    return [
      {
        path: currentPath,
        name: `${filename}.${extension}`,
        file,
      },
    ];
  },
};

const deleteFileFolderConfig: PlainDialogBodyConfiguration = {
  Component: DeleteContentDialogBody,
  titleKey: 'deleteDialog.deleteFiles',
  submitKey: 'deleteDialog.continue',
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
  httpMethod: HttpMethods.DELETE,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_form, currentPath, inputValues) => {
    const { selectedItems } = inputValues;
    if (!selectedItems || selectedItems.length === 0) {
      return Promise.resolve([]);
    }
    return Promise.resolve(
      selectedItems.map((item) => ({
        path: `${stripTrailingSlash(currentPath)}/${item.filename}`,
      })),
    );
  },
};

const renameFileFolderConfig: RenameDialogBodyConfiguration = {
  Component: CreateOrRenameContentDialogBody,
  schema: z.object({
    filename: z.string().min(1, t('filesharing.tooltips.NewFileNameRequired')),
    extension: z.string(),
  }),
  titleKey: 'fileRenameContent.rename',
  submitKey: 'fileRenameContent.rename',
  initialValues: initialFormValues,
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
  httpMethod: HttpMethods.PATCH,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: true,
  isRenaming: true,
  getData: async (form, currentPath, inputValues) => {
    const { selectedItems } = inputValues;
    if (!selectedItems || selectedItems.length === 0) {
      return Promise.resolve([]);
    }
    const filename =
      form.getValues('extension') !== undefined
        ? `${String(form.getValues('filename')) + String(form.getValues('extension'))}`
        : form.getValues('filename');
    const cleanedPath = stripTrailingSlash(currentPath);
    return Promise.resolve([
      {
        path: `${cleanedPath}/${selectedItems[0]?.filename}`,
        newPath: `${cleanedPath}/${filename}`,
      },
    ]);
  },
};

const copyFileOrFolderConfig: PlainDialogBodyConfiguration = {
  Component: CopyContentDialogBody,
  titleKey: 'copyItemDialog.copyFilesOrDirectoriesToDirectory',
  submitKey: 'copyItemDialog.copy',
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COPY}`,
  httpMethod: HttpMethods.POST,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_form, currentPath, { moveOrCopyItemToPath, selectedItems }: DialogInputValues) => {
    if (!moveOrCopyItemToPath || !selectedItems) return Promise.resolve([]);
    const sourceBase = stripTrailingSlash(currentPath);
    const targetBase = stripTrailingSlash(moveOrCopyItemToPath.filePath);
    return Promise.resolve(
      selectedItems.map((i) => ({ path: `${sourceBase}/${i.filename}`, newPath: `${targetBase}/${i.filename}` })),
    );
  },
};

const moveFileFolderConfig: MoveDialogBodyConfiguration = {
  Component: MoveDirectoryDialogBody,
  titleKey: 'moveItemDialog.changeDirectory',
  submitKey: 'moveItemDialog.move',
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
  httpMethod: HttpMethods.PATCH,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_form, currentPath, { moveOrCopyItemToPath, selectedItems }) => {
    if (!moveOrCopyItemToPath || !selectedItems) return Promise.resolve([]);
    const sourceBase = stripTrailingSlash(currentPath);
    const targetBase = stripTrailingSlash(moveOrCopyItemToPath.filePath);

    return Promise.resolve(
      selectedItems.map((i) => ({ path: `${sourceBase}/${i.filename}`, newPath: `${targetBase}/${i.filename}` })),
    );
  },
};

const shareFileOrFolderConfig: PlainDialogBodyConfiguration = {
  Component: PublicShareContentsDialogBody,
  titleKey: 'filesharing.publicFileSharing.sharePublicFile',
  submitKey: 'shareDialog.share',
  endpoint: FILESHARING_SHARED_FILES_API_ENDPOINT,
  httpMethod: HttpMethods.POST,
  type: ContentType.FILE,
  hideSubmitButton: true,
  desktopComponentClassName: 'max-w-[85%] min-w-[10%] max-h-full',
  requiresForm: false,
};

const dialogBodyConfigurations: Record<FileActionType, DialogBodyConfiguration> = {
  createFolder: createFolderConfig,
  createFile: createFileConfig,
  deleteFileOrFolder: deleteFileFolderConfig,
  renameFileOrFolder: renameFileFolderConfig,
  copyFileOrFolder: copyFileOrFolderConfig,
  moveFileOrFolder: moveFileFolderConfig,
  shareFileOrFolder: shareFileOrFolderConfig,
};

function getDialogBodyConfigurations(action: FileActionType) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.deleteFileOrFolder;
}

export default getDialogBodyConfigurations;
