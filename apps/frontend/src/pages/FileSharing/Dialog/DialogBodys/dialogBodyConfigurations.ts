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
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogProps';
import MoveDirectoryDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveDirectoryDialogBody';
import CopyContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/CopyContentDialogBody';
import ShareFileLinkDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/ShareFileLinkDialogBody';
import PublicShareFileLinkProps from '@libs/filesharing/types/publicShareFileLinkProps';
import fileSharingFromSchema from '@libs/filesharing/types/fileSharingFromSchema';
import DialogInputValues from '@libs/filesharing/types/dialogInputValues';
import { FILESHARING_SHARED_FILES_API_ENDPOINT } from '@libs/filesharing/constants/apiEndpoints';

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
  disableSubmitButton?: boolean;
  desktopComponentClassName?: string;
  mobileComponentClassName?: string;
  getData?: (
    form: UseFormReturn<FileSharingFormValues>,
    currentPath: string,
    inputValues: DialogInputValues,
  ) => Promise<
    | PathChangeOrCreateProps
    | PathChangeOrCreateProps[]
    | FileUploadProps[]
    | DeleteFileProps[]
    | PublicShareFileLinkProps
  >;
  requiresForm?: boolean;
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
interface DeleteDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType;
}
interface UploadFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType;
}
interface MoveDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<MoveContentDialogBodyProps>;
}
interface ShareDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType;
}

type DialogBodyConfiguration =
  | CreateFolderDialogBodyConfiguration
  | CreateFileDialogBodyConfiguration
  | RenameDialogBodyConfiguration
  | DeleteDialogBodyConfiguration
  | UploadFileDialogBodyConfiguration
  | MoveDialogBodyConfiguration
  | ShareDialogBodyConfiguration;

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
    const cleanedPath = getPathWithoutWebdav(currentPath);

    return Promise.resolve({
      path: cleanedPath,
      newPath: filename,
    });
  },
};

const createFileConfig: CreateFileDialogBodyConfiguration = {
  Component: CreateOrRenameContentDialogBody,
  titleKey: 'fileCreateNewContent.fileDialogTitle',
  submitKey: 'fileCreateNewContent.createButtonText',
  initialValues: initialFormValues,
  schema: fileSharingFromSchema,
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.PUT,
  type: ContentType.FILE,
  requiresForm: true,
  async getData(form, currentPath, { documentVendor, selectedFileType }: DialogInputValues) {
    const filename = form.getValues('filename');
    const { file, extension } = await generateFile(selectedFileType, filename, documentVendor);
    return [
      {
        path: getPathWithoutWebdav(currentPath),
        name: `${filename}.${extension}`,
        file,
      },
    ];
  },
};

const deleteFileFolderConfig: DeleteDialogBodyConfiguration = {
  Component: DeleteContentDialogBody,
  titleKey: 'deleteDialog.deleteFiles',
  submitKey: 'deleteDialog.continue',
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.DELETE,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_form, currentPath, { selectedItems }: DialogInputValues) => {
    if (!selectedItems?.length) return Promise.resolve([]);
    const base = getPathWithoutWebdav(currentPath);
    return Promise.resolve(selectedItems.map((i) => ({ path: `${base}/${i.filename}` })));
  },
};

const renameFileFolderConfig: RenameDialogBodyConfiguration = {
  Component: CreateOrRenameContentDialogBody,
  titleKey: 'fileRenameContent.rename',
  submitKey: 'fileRenameContent.rename',
  initialValues: initialFormValues,
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.PATCH,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: true,
  isRenaming: true,
  async getData(form, currentPath, { selectedItems }: DialogInputValues) {
    if (!selectedItems?.length) return Promise.resolve([]);
    const filename = form.getValues('extension')
      ? `${form.getValues('filename')}${form.getValues('extension')}`
      : form.getValues('filename');
    const base = getPathWithoutWebdav(currentPath);
    return [
      {
        path: `${base}/${selectedItems[0].filename}`,
        newPath: `${base}/${filename}`,
      },
    ];
  },
};

const uploadFileConfig: UploadFileDialogBodyConfiguration = {
  Component: UploadContentBody,
  titleKey: 'filesharingUpload.title',
  submitKey: 'filesharingUpload.upload',
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.PUT,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_f, currentPath, { filesToUpload }: DialogInputValues) => {
    const base = getPathWithoutWebdav(currentPath);
    if (!filesToUpload?.length) return Promise.resolve([]);
    return Promise.resolve(filesToUpload.map((f) => ({ path: base, name: f.name, file: f })));
  },
};

const copyFileOrFolderConfig: UploadFileDialogBodyConfiguration = {
  Component: CopyContentDialogBody,
  titleKey: 'copyItemDialog.copyFilesOrDirectoriesToDirectory',
  submitKey: 'copyItemDialog.copy',
  endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COPY}`,
  httpMethod: HttpMethods.POST,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_f, currentPath, { moveOrCopyItemToPath, selectedItems }: DialogInputValues) => {
    if (!moveOrCopyItemToPath || !selectedItems) return Promise.resolve([]);
    const srcBase = getPathWithoutWebdav(currentPath);
    const tgtBase = getPathWithoutWebdav(moveOrCopyItemToPath.filePath);
    return Promise.resolve(
      selectedItems.map((i) => {
        const name = encodeURIComponent(i.filename);
        return { path: `${srcBase}/${name}`, newPath: `${tgtBase}/${name}` };
      }),
    );
  },
};

const moveFileFolderConfig: MoveDialogBodyConfiguration = {
  Component: MoveDirectoryDialogBody,
  titleKey: 'moveItemDialog.changeDirectory',
  submitKey: 'moveItemDialog.move',
  endpoint: FileSharingApiEndpoints.FILESHARING_ACTIONS,
  httpMethod: HttpMethods.PATCH,
  type: ContentType.FILE || ContentType.DIRECTORY,
  requiresForm: false,
  getData: (_f, currentPath, { moveOrCopyItemToPath, selectedItems }: DialogInputValues) => {
    if (!moveOrCopyItemToPath || !selectedItems) return Promise.resolve([]);
    const dst = getPathWithoutWebdav(moveOrCopyItemToPath.filePath);
    const src = getPathWithoutWebdav(currentPath);
    return Promise.resolve(
      selectedItems.map((i) => ({
        path: encodeURI(`${src}/${i.filename}`),
        newPath: encodeURI(`${dst}/${i.filename}`),
      })),
    );
  },
};

const shareFileOrFolderConfig: ShareDialogBodyConfiguration = {
  Component: ShareFileLinkDialogBody,
  titleKey: 'filesharing.publicFileSharing.sharePublicFile',
  submitKey: 'shareDialog.share',
  endpoint: FILESHARING_SHARED_FILES_API_ENDPOINT,
  httpMethod: HttpMethods.POST,
  type: ContentType.FILE,
  disableSubmitButton: true,
  desktopComponentClassName: 'max-w-[60%] max-h-[75%] min-h-fit-content',
  requiresForm: false,
};

const dialogBodyConfigurations: Record<FileActionType, DialogBodyConfiguration> = {
  createFolder: createFolderConfig,
  createFile: createFileConfig,
  deleteFileFolder: deleteFileFolderConfig,
  renameFileFolder: renameFileFolderConfig,
  uploadFile: uploadFileConfig,
  copyFileOrFolder: copyFileOrFolderConfig,
  moveFileFolder: moveFileFolderConfig,
  shareFileOrFolder: shareFileOrFolderConfig,
};

function getDialogBodySetup(action: FileActionType) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.deleteFileFolder;
}

export default getDialogBodySetup;
