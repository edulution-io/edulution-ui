import { z } from 'zod';
import CreateOrRenameContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/CreateOrRenameContentDialogBody';

import DeleteContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/DeleteContentDialogBody';
import UploadContentBody from '@/pages/FileSharing/dialog/DialogBodys/UploadContentBody';
import MoveContentDialogBody from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import generateFile from '@/pages/FileSharing/fileoperations/generateFileTypes';
import FileSharingApiEndpoints from '@libs/filesharing/fileSharingApiEndpoints';
import { HttpMethodes } from '@libs/common/types/http-methods';
import FileAction from '@libs/filesharing/FileAction';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/fileManagerUtilities';
import { t } from 'i18next';
import EmptyDialogProps from '@libs/ui/types/filesharing/FilesharingEmptyProps';
import { FilesharingDialogProps, FileSharingFormValues } from '@libs/ui/types/filesharing/FilesharingDialogProps';

interface DialogBodyConfigurationBase {
  schema?: z.ZodSchema<FileSharingFormValues>;
  titleKey: string;
  submitKey: string;
  initialValues?: FileSharingFormValues;
  endpoint: string;
  httpMethod: HttpMethodes;
  getData: (
    form: UseFormReturn<FileSharingFormValues>,
    currentPath: string,
    inputValues: {
      selectedItems?: DirectoryFile[];
      moveItemsToPath?: DirectoryFile;
      selectedFileType?: { extension: string; generate: string };
      filesToUpload?: File[];
    },
  ) => Promise<Record<string, string> | Record<string, string>[] | { path: string; name: string; file: File }[]>;
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
};

const dialogBodyConfigurations: Record<string, DialogBodyConfiguration> = {
  createFolder: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, t('filesharing.tooltips.folderNameRequired')),
    }),
    titleKey: 'fileCreateNewContent.directoryDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.CREATE_FOLDER}`,
    httpMethod: HttpMethodes.PUT,
    getData: (form, currentPath: string) => {
      const filename = String(form.getValues('filename'));
      const cleanedPath = clearPathFromWebdav(currentPath);
      return Promise.resolve({ path: cleanedPath, folderName: filename });
    },
  },
  createFile: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, t('filesharing.tooltips.FileNameRequired')),
    }),
    titleKey: 'fileCreateNewContent.fileDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.UPLOAD_FILE}`,
    httpMethod: HttpMethodes.POST,
    getData: async (form, currentPath, inputValues) => {
      const { selectedFileType } = inputValues;
      const fileType = selectedFileType?.extension || '';
      const filename = String(form.getValues('filename'));
      const filenameWithExtension = filename + fileType;
      const generate = selectedFileType?.generate || '';
      const generateFileMethod = generateFile[generate];
      const file = await generateFileMethod(generate);
      const cleanedPath = clearPathFromWebdav(currentPath);
      return [
        {
          path: cleanedPath,
          name: filenameWithExtension,
          file,
        },
      ];
    },
  },
  name: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, t('filesharing.tooltips.NewFileNameRequired')),
    }),
    titleKey: 'fileRenameContent.rename',
    submitKey: 'fileRenameContent.rename',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.RENAME}`,
    httpMethod: HttpMethodes.PUT,
    getData: async (form, currentPath, inputValues) => {
      const { selectedItems } = inputValues;
      if (!selectedItems || selectedItems.length === 0) {
        return Promise.resolve([]);
      }
      const filename = String(form.getValues('filename'));
      const cleanedPath = clearPathFromWebdav(currentPath);
      const originPath = `${cleanedPath}/${selectedItems[0]?.basename}`;
      return Promise.resolve({ originPath, newPath: `${cleanedPath}/${filename}` });
    },
  },

  delete: {
    Component: DeleteContentDialogBody,
    titleKey: 'deleteDialog.deleteFiles',
    submitKey: 'deleteDialog.continue',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.DELETE}`,
    httpMethod: HttpMethodes.DELETE,
    getData: (_form, currentPath, inputValues) => {
      const { selectedItems } = inputValues;
      if (!selectedItems || selectedItems.length === 0) {
        return Promise.resolve([]);
      }
      const cleanedPath = clearPathFromWebdav(currentPath);
      return Promise.resolve(
        selectedItems.map((item) => ({
          path: `${cleanedPath}/${item.basename}`,
        })),
      );
    },
  },

  uploadFile: {
    Component: UploadContentBody,
    titleKey: 'filesharingUpload.title',
    submitKey: 'filesharingUpload.upload',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.UPLOAD_FILE}`,
    httpMethod: HttpMethodes.POST,
    getData: (_form, currentPath, inputValues) => {
      const { filesToUpload } = inputValues;
      const cleanedPath = clearPathFromWebdav(currentPath);
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

  locations: {
    Component: MoveContentDialogBody,
    titleKey: 'moveItemDialog.changeDirectory',
    submitKey: 'moveItemDialog.move',
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.MOVE}`,
    httpMethod: HttpMethodes.PUT,
    getData: (_form, currentPath, inputValues) => {
      const { moveItemsToPath, selectedItems } = inputValues;
      if (!moveItemsToPath || !selectedItems) {
        return Promise.resolve([]);
      }
      const newCleanedPath = clearPathFromWebdav(moveItemsToPath.filename);
      const cleanedPath = clearPathFromWebdav(currentPath);
      return Promise.resolve(
        selectedItems.map((item) => ({
          originPath: `${cleanedPath}/${item.basename}`,
          newPath: `${newCleanedPath}/${item.basename}`,
        })),
      );
    },
  },
};

function getDialogBodySetup(action: FileAction) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.delete;
}

export default getDialogBodySetup;
