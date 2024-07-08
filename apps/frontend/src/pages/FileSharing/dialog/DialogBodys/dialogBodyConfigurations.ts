import { z } from 'zod';
import CreateOrRenameContentDialogBody, {
  CreateNewContentDialogBodyProps,
} from '@/pages/FileSharing/dialog/DialogBodys/CreateOrRenameContentDialogBody';
import ActionItems from '@/pages/FileSharing/dialog/ActionsType/ActionItems';
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
import HttpMethod from '@/pages/FileSharing/dialog/HttpMethod';
import apiPath from '@/pages/FileSharing/utilities/apiPath';
import generateFile from '@/pages/FileSharing/fileoperations/generateFileTypes';

interface DialogBodyConfigurationBase {
  schema?: z.ZodSchema<FormData>;
  titleKey: string;
  submitKey: string;
  initialValues?: FormData;
  endpoint: string;
  httpMethod: HttpMethod;
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
      filename: z.string().min(1, 'Folder Name is required'),
    }),
    titleKey: 'fileCreateNewContent.directoryDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${apiPath.FILESHARING_ACTIONS}/createFolder`,
    httpMethod: HttpMethod.POST,
    getData: (form, currentPath: string) => {
      const filename = String(form.getValues('filename'));
      const cleanedPath = currentPath.replace('/webdav/', '');
      return Promise.resolve({ path: cleanedPath, folderName: filename });
    },
  },
  createFile: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, 'File Name is required'),
    }),
    titleKey: 'fileCreateNewContent.fileDialogTitle',
    submitKey: 'fileCreateNewContent.createButtonText',
    initialValues: initialFormValues,
    endpoint: `${apiPath.FILESHARING_ACTIONS}/uploadFile`,
    httpMethod: HttpMethod.POST,
    getData: async (form, currentPath, inputValues) => {
      const { selectedFileType } = inputValues;
      const fileType = selectedFileType?.extension || '';
      const filename = String(form.getValues<string>('filename'));
      const filenameWithExtension = filename + fileType;
      const generate = selectedFileType?.generate || '';
      const generateFileMethod = generateFile[generate];

      if (!generateFileMethod) {
        throw new Error(`Unsupported file type: ${generate}`);
      }

      const file = await generateFileMethod(generate);
      const cleanedPath = currentPath.replace('/webdav/', '');
      return [
        {
          path: cleanedPath,
          name: filenameWithExtension,
          file,
        },
      ];
    },
  },
  rename: {
    Component: CreateOrRenameContentDialogBody,
    schema: z.object({
      filename: z.string().min(1, 'New file name is required'),
    }),
    titleKey: 'fileRenameContent.rename',
    submitKey: 'fileRenameContent.rename',
    initialValues: initialFormValues,
    endpoint: `${apiPath.FILESHARING_ACTIONS}/rename`,
    httpMethod: HttpMethod.PUT,
    getData: async (form, currentPath, inputValues) => {
      const { selectedItems } = inputValues;
      if (!selectedItems || selectedItems.length === 0) {
        throw new Error('No items selected for renaming');
      }
      const filename = String(form.getValues('filename'));
      const cleanedPath = currentPath.replace('/webdav/', '');
      const originPath = `${cleanedPath}/${selectedItems[0].basename}`;
      return Promise.resolve({ originPath, newPath: `${cleanedPath}/${filename}` });
    },
  },

  delete: {
    Component: DeleteContentDialogBody,
    titleKey: 'deleteDialog.deleteFiles',
    submitKey: 'deleteDialog.continue',
    endpoint: `${apiPath.FILESHARING_ACTIONS}/delete`,
    httpMethod: HttpMethod.DELETE,
    getData: (_form, currentPath, inputValues) => {
      const { selectedItems } = inputValues;
      if (!selectedItems || selectedItems.length === 0) {
        throw new Error('No items selected for renaming');
      }
      const cleanedPath = currentPath.replace('/webdav/', '');
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
    endpoint: `${apiPath.FILESHARING_ACTIONS}/uploadFile`,
    httpMethod: HttpMethod.POST,
    getData: (_form, currentPath, inputValues) => {
      const { filesToUpload } = inputValues;
      const cleanedPath = currentPath.replace('/webdav/', '');
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

  move: {
    Component: MoveContentDialogBody,
    titleKey: 'moveItemDialog.changeDirectory',
    submitKey: 'moveItemDialog.move',
    endpoint: `${apiPath.FILESHARING_ACTIONS}/move`,
    httpMethod: HttpMethod.PUT,
    getData: (_form, currentPath, inputValues) => {
      const { moveItemsToPath, selectedItems } = inputValues;
      if (!moveItemsToPath || !selectedItems) {
        throw new Error('No items selected for renaming');
      }
      const newCleanedPath = moveItemsToPath.filename.replace('/webdav', '');
      const cleanedPath = currentPath.replace('/webdav', '');
      return Promise.resolve(
        selectedItems.map((item) => ({
          originPath: `${cleanedPath}/${item.basename}`,
          newPath: `${newCleanedPath}/${item.basename}`,
        })),
      );
    },
  },
};

function getDialogBodySetup(action: ActionItems) {
  return dialogBodyConfigurations[action] || dialogBodyConfigurations.createFolder;
}

export default getDialogBodySetup;
