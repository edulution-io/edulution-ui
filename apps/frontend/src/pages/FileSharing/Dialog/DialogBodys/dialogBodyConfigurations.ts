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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import generateFile from '@/pages/FileSharing/utilities/generateFile';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { HttpMethods } from '@libs/common/types/http-methods';
import { t } from 'i18next';

import { FilesharingDialogProps, FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import DocumentVendorsType from '@libs/filesharing/types/documentVendorsType';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogProps';
import MoveDirectoryDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveDirectoryDialogBody';
import CopyContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/CopyContentDialogBody';

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
  getData: (
    form: UseFormReturn<FileSharingFormValues>,
    currentPath: string,
    inputValues: {
      selectedItems?: DirectoryFileDTO[];
      moveOrCopyItemToPath?: DirectoryFileDTO;
      selectedFileType: TAvailableFileTypes | '';
      filesToUpload?: File[];
      documentVendor: DocumentVendorsType;
    },
  ) => Promise<PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[]>;
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

type DialogBodyConfiguration =
  | CreateFolderDialogBodyConfiguration
  | CreateFileDialogBodyConfiguration
  | RenameDialogBodyConfiguration
  | DeleteDialogBodyConfiguration
  | UploadFileDialogBodyConfiguration
  | MoveDialogBodyConfiguration;

const initialFormValues: FileSharingFormValues = {
  filename: '',
  extension: '',
};

const dialogBodyConfigurations: Record<string, DialogBodyConfiguration> = {
  createFolder: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, t('filesharing.tooltips.folderNameRequired')),
      extension: z.string(),
    }),
    titleKey: 'fileCreateNewContent.directoryDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
    httpMethod: HttpMethods.POST,
    type: ContentType.DIRECTORY,
    requiresForm: true,
    getData: (form, currentPath: string) => {
      const filename = String(form.getValues('filename'));
      const cleanedPath = getPathWithoutWebdav(currentPath);
      return Promise.resolve({ path: cleanedPath, newPath: filename });
    },
  },

  createFile: {
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
          path: getPathWithoutWebdav(currentPath),
          name: `${filename}.${extension}`,
          file,
        },
      ];
    },
  },

  deleteFileOrFolder: {
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
      const cleanedPath = getPathWithoutWebdav(currentPath);
      return Promise.resolve(
        selectedItems.map((item) => ({
          path: `${cleanedPath}/${item.filename}`,
        })),
      );
    },
  },

  renameFileOrFolder: {
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
      const cleanedPath = getPathWithoutWebdav(currentPath);
      return Promise.resolve([
        {
          path: `${cleanedPath}/${selectedItems[0]?.filename}`,
          newPath: `${cleanedPath}/${filename}`,
        },
      ]);
    },
  },

  uploadFile: {
    Component: UploadContentBody,
    titleKey: 'filesharingUpload.title',
    submitKey: 'filesharingUpload.upload',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
    httpMethod: HttpMethods.POST,
    type: ContentType.FILE || ContentType.DIRECTORY,
    requiresForm: false,
    getData: (_form, currentPath, inputValues) => {
      const { filesToUpload } = inputValues;
      const cleanedPath = getPathWithoutWebdav(currentPath);
      if (!filesToUpload || filesToUpload.length === 0) {
        return Promise.resolve([]);
      }
      return Promise.resolve(
        filesToUpload.map((file: File) => ({
          path: cleanedPath,
          name: file.name,
          file,
        })),
      );
    },
  },

  copyFileOrFolder: {
    Component: CopyContentDialogBody,
    titleKey: 'copyItemDialog.copyFilesOrDirectoriesToDirectory',
    submitKey: 'copyItemDialog.copy',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.COPY}`,
    httpMethod: HttpMethods.POST,
    type: ContentType.FILE || ContentType.DIRECTORY,
    requiresForm: false,

    getData: (_form, currentPath, inputValues) => {
      const { moveOrCopyItemToPath, selectedItems } = inputValues;
      if (!moveOrCopyItemToPath || !selectedItems) {
        return Promise.resolve([]);
      }
      const sourceBase = getPathWithoutWebdav(currentPath);
      const targetBase = getPathWithoutWebdav(moveOrCopyItemToPath.filePath);

      return Promise.resolve(
        selectedItems.map((item) => {
          const encodedName = encodeURIComponent(item.filename);
          return {
            path: `${sourceBase}/${encodedName}`,
            newPath: `${targetBase}/${encodedName}`,
          };
        }),
      );
    },
  },

  moveFileOrFolder: {
    Component: MoveDirectoryDialogBody,
    titleKey: 'moveItemDialog.changeDirectory',
    submitKey: 'moveItemDialog.move',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
    httpMethod: HttpMethods.PATCH,
    type: ContentType.FILE || ContentType.DIRECTORY,
    requiresForm: false,

    getData: (_form, currentPath, inputValues) => {
      const { moveOrCopyItemToPath, selectedItems } = inputValues;
      if (!moveOrCopyItemToPath || !selectedItems) {
        return Promise.resolve([]);
      }
      const newCleanedPath = getPathWithoutWebdav(moveOrCopyItemToPath.filePath);
      const cleanedPath = getPathWithoutWebdav(currentPath);

      return Promise.resolve(
        selectedItems.map((item) => ({
          path: encodeURI(`${cleanedPath}/${item.filename}`),
          newPath: encodeURI(`${newCleanedPath}/${item.filename}`),
        })),
      );
    },
  },
};

function getDialogBodySetup(action: FileActionType) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.deleteFileOrFolder;
}

export default getDialogBodySetup;
