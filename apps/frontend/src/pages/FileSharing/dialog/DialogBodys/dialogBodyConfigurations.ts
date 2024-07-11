import { z } from 'zod';
import CreateOrRenameContentDialogBody, {
  CreateNewContentDialogBodyProps,
} from '@/pages/FileSharing/dialog/DialogBodys/CreateOrRenameContentDialogBody';

import DeleteContentDialogBody, {
  DeleteContentDialogBodyProps,
} from '@/pages/FileSharing/dialog/DialogBodys/DeleteContentDialogBody';
import UploadContentBody, { UploadContentBodyProps } from '@/pages/FileSharing/dialog/DialogBodys/UploadContentBody';
import MoveContentDialogBody, {
  MoveContentDialogBodyProps,
} from '@/pages/FileSharing/dialog/DialogBodys/MoveContentDialogBody';
import React from 'react';
import FormData from '@/pages/FileSharing/dialog/FormData';
import { UseFormReturn } from 'react-hook-form';
import { DirectoryFile } from '@libs/filesharing/filesystem';
import generateFile from '@/pages/FileSharing/fileoperations/generateFileTypes';
import FileSharingApiEndpoints from '@libs/filesharing/fileSharingApiEndpoints';
import { HttpMethodes } from '@libs/common/types/http-methods';
import FileAction from '@libs/filesharing/FileAction';
import { clearPathFromWebdav } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { t } from 'i18next';

interface DialogBodyConfigurationBase {
  schema?: z.ZodSchema<FormData>;
  titleKey: string;
  submitKey: string;
  initialValues?: FormData;
  endpoint: string;
  httpMethod: HttpMethodes;
  getData: (
    form: UseFormReturn<Record<string, unknown>>,
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
  Component: React.ComponentType<CreateNewContentDialogBodyProps>;
}

interface CreateFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<CreateNewContentDialogBodyProps>;
}

interface RenameDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<CreateNewContentDialogBodyProps>;
}

interface DeleteDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<DeleteContentDialogBodyProps>;
}

interface UploadFileDialogBodyConfiguration extends DialogBodyConfigurationBase {
  Component: React.ComponentType<UploadContentBodyProps>;
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

const initialFormValues: FormData = {
  filename: '',
};

const dialogBodyConfigurations: Record<string, DialogBodyConfiguration> = {
  createFolder: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, t('filesharing.filesharing.tooltips.folderNameRequired')),
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
      filename: z.string().min(1, t('filesharing.filesharing.tooltips.FileNameRequired')),
    }),
    titleKey: 'fileCreateNewContent.fileDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.UPLOAD_FILE}`, // Due to the fact that we create a doxc file which needs to be uploaded
    httpMethod: HttpMethodes.POST,
    getData: async (form, currentPath, inputValues) => {
      const { selectedFileType } = inputValues;
      const fileType = selectedFileType?.extension || '';
      const filename = String(form.getValues<string>('filename'));
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
      filename: z.string().min(1, t('filesharing.filesharing.tooltips.NewFileNameRequired')),
    }),
    titleKey: 'fileRenameContent.rename',
    submitKey: 'fileRenameContent.rename',
    initialValues: initialFormValues,
    endpoint: `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileAction.RENAME}`,
    httpMethod: HttpMethodes.PUT,
    getData: async (form, currentPath, inputValues) => {
      const { selectedItems } = inputValues;
      if (!selectedItems || selectedItems.length === 0) {
        throw new Error('No items selected for renaming');
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
        throw new Error('No items selected for renaming');
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
        throw new Error('No items selected for renaming');
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
        throw new Error('No items selected for renaming');
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
