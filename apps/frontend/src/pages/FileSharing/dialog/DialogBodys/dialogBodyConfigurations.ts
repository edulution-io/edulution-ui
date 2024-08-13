import { z } from 'zod';
import CreateOrRenameContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/CreateOrRenameContentDialogBody';
import DeleteContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/DeleteContentDialogBody';
import UploadContentBody from '@/pages/FileSharing/dialog/DialogBodys/UploadContentBody';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import generateFile from '@/pages/FileSharing/fileoperations/generateFileTypes';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { HttpMethods } from '@libs/common/types/http-methods';
import { t } from 'i18next';

import { FilesharingDialogProps, FileSharingFormValues } from '@libs/filesharing/types/filesharingDialogProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import EmptyDialogProps from '@libs/filesharing/types/filesharingEmptyProps';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';

interface DialogBodyConfigurationBase {
  schema?: z.ZodSchema<FileSharingFormValues>;
  isRenaming?: boolean;
  titleKey: string;
  submitKey: string;
  initialValues?: FileSharingFormValues;
  endpoint: string;
  type: ContentType;
  httpMethod: HttpMethods;
  getData: (
    form: UseFormReturn<FileSharingFormValues>,
    currentPath: string,
    inputValues: {
      selectedItems?: DirectoryFileDTO[];
      moveItemsToPath?: DirectoryFileDTO;
      selectedFileType?: { extension: string; generate: string };
      filesToUpload?: File[];
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
  Component: React.ComponentType<EmptyDialogProps>;
}

interface UploadFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<EmptyDialogProps>;
}

interface MoveDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<EmptyDialogProps>;
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
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
    httpMethod: HttpMethods.PUT,
    type: ContentType.FILE,
    requiresForm: true,
    getData: async (form, currentPath, inputValues) => {
      const { selectedFileType } = inputValues;
      const fileType = selectedFileType?.extension || '';
      const filename = String(form.getValues('filename'));
      const filenameWithExtension = filename + fileType;
      const generate = selectedFileType?.generate || '';
      const generateFileMethod = generateFile[generate];
      const file = await generateFileMethod(generate);
      const cleanedPath = getPathWithoutWebdav(currentPath);
      return [
        {
          path: cleanedPath,
          name: filenameWithExtension,
          file,
        },
      ];
    },
  },

  deleteFileFolder: {
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
          path: `${cleanedPath}/${item.basename}`,
        })),
      );
    },
  },

  renameFileFolder: {
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
      return Promise.resolve({
        path: `${cleanedPath}/${selectedItems[0]?.basename}`,
        newPath: `${cleanedPath}/${filename}`,
      });
    },
  },

  uploadFile: {
    Component: UploadContentBody,
    titleKey: 'filesharingUpload.title',
    submitKey: 'filesharingUpload.upload',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
    httpMethod: HttpMethods.PUT,
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

  moveFileFolder: {
    Component: MoveContentDialogBody,
    titleKey: 'moveItemDialog.changeDirectory',
    submitKey: 'moveItemDialog.move',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
    httpMethod: HttpMethods.PATCH,
    type: ContentType.FILE || ContentType.DIRECTORY,
    requiresForm: false,
    getData: (_form, currentPath, inputValues) => {
      const { moveItemsToPath, selectedItems } = inputValues;
      if (!moveItemsToPath || !selectedItems) {
        return Promise.resolve([]);
      }
      const newCleanedPath = getPathWithoutWebdav(moveItemsToPath.filename);
      const cleanedPath = getPathWithoutWebdav(currentPath);
      return Promise.resolve(
        selectedItems.map((item) => ({
          path: `${cleanedPath}/${item.basename}`,
          newPath: `${newCleanedPath}/${item.basename}`,
        })),
      );
    },
  },
};

function getDialogBodySetup(action: FileActionType) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.deleteFileFolder;
}

export default getDialogBodySetup;
