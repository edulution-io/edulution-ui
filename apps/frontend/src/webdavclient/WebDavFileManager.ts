import { translateKey } from '@/utils/common';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import ApiResponseHandler from '@/utils/ApiResponseHandler';
import {
  addDirectory,
  addFile,
  changeFileName,
  changeLocation,
  deleteFile,
  downloadFile,
  uploadFiles,
} from '@/webdavclient/WebDavAPI';
import { IWebDavFileManager } from './IWebDavFileManager';
import { DirectoryFile } from '../datatypes/filesystem';

function handleApiResponse(response: { success: boolean; message?: string; status?: number } | { success: boolean }): {
  success: boolean;
  message: string;
  status: number;
} {
  if ('message' in response && response.success) {
    return {
      success: response.success,
      message: response.message || translateKey('response.successfully'),
      status: response.status || 200,
    };
  }

  if (response.success) {
    return {
      success: response.success,
      message: translateKey('response.successfully'),
      status: 200,
    };
  }

  return {
    success: false,
    message: translateKey('response.failed'),
    status: 500,
  };
}

const handleApiError = (error: Response) => {
  let status = 500;
  let statusText = translateKey('response.error');
  if (error instanceof Error && 'status' in error) {
    status = typeof error.status === 'number' ? error.status : 500;
    statusText = error.message ? error.message : translateKey('response.error');
  }
  return ApiResponseHandler.handleApiResponse(
    new Response(null, {
      status,
      statusText,
    }),
  );
};

const createDirectory: IWebDavFileManager['createDirectory'] = async (path: string, folderName: string) => {
  try {
    const response = await addDirectory(path.replace('/webdav', ''), folderName);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const createFile: IWebDavFileManager['createFile'] = async (path: string, fileName: string) => {
  try {
    const response = await addFile(path.replace('/webdav', ''), fileName);
    console.log('Response:', response);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const deleteItem: IWebDavFileManager['deleteItem'] = async (path: string) => {
  try {
    const response = await deleteFile(path.replace('/webdav', ''));
    return handleApiResponse(response);
  } catch (error) {
    console.error('Delete operation failed:', error);
    return handleApiError(error as Response);
  }
};

const renameItem: IWebDavFileManager['renameItem'] = async (path: string, toPath: string) => {
  try {
    const resp = await changeFileName(path, toPath);
    return handleApiResponse(resp);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const moveFile = async (sourcePath: string, destinationPath: string) => {
  console.log('Moving file:', sourcePath, 'to:', destinationPath);
  try {
    const response = await changeLocation(sourcePath.replace('/webdav/', ''), destinationPath.replace('/webdav/', ''));
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const moveItems: IWebDavFileManager['moveItems'] = async (
  items: DirectoryFile[] | DirectoryFile,
  toPath: string | undefined,
) => {
  if (!toPath) {
    console.error('Destination path is undefined.');
    return {
      success: false,
      message: translateKey('response.destination_path_is_undefined'),
      status: 400,
    };
  }

  const itemsSet = new Set(Array.isArray(items) ? items : [items]);
  const results = [];

  for (const item of itemsSet) {
    const destination = `${toPath}/${getFileNameFromPath(item.filename)}`;
    if (destination === item.filename) {
      console.log(`No move needed for ${item.filename}`);
    }

    console.log(`Attempting to move file from ${item.filename} to ${destination}`);
    const moveResult = await moveFile(item.filename, destination);
    console.log(moveResult);
    results.push(moveResult);

    if (!moveResult.success) {
      console.error(`Failed to move file: ${item.filename}`);
      break;
    }
  }

  const failed = results.find((result) => !result.success);
  return failed
    ? { ...failed }
    : {
        success: true,
        message: translateKey('response.all_items_moved_successfully'),
        status: 200,
      };
};

const uploadFile = async (file: File, filePath: string) => {
  console.log('Uploading file:', file.name);
  try {
    const response = await uploadFiles(filePath, file);
    console.log('Upload successful:', file.name);
    return response;
  } catch (error) {
    console.error('Error uploading file:', file.name, error);
    throw error;
  }
};

const uploadMultipleFiles: IWebDavFileManager['uploadMultipleFiles'] = (files: File[], remotePath: string) => {
  const uploadPromises = files.map(async (file) => {
    const filePath = `${remotePath}/${file.name}`;
    try {
      const response = await uploadFile(file, filePath);
      return {
        success: true,
        message: translateKey('response.file_uploaded_successfully', {
          fileName: file.name,
        }),
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: translateKey('response.file_uploaded_failed', {
          fileName: file.name,
          status: error ?? 'Unknown error',
        }),
      };
    }
  });

  return Promise.all(uploadPromises);
};
const triggerFileDownload: IWebDavFileManager['triggerFileDownload'] = (path: string) => {
  downloadFile(path)
    .then((downloadLink) => {
      if (typeof downloadLink === 'string') {
        console.log('Download link:', downloadLink);
        const anchor = document.createElement('a');
        anchor.href = downloadLink;
        const fileName = getFileNameFromPath(path);
        anchor.setAttribute('download', fileName);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else {
        console.error('Failed to get the download link:', path);
      }
    })
    .catch((err) => {
      console.error('Error downloading file', err);
    });
};

const webDavFunctions: IWebDavFileManager = {
  createDirectory,
  createFile,
  deleteItem,
  moveItems,
  renameItem,
  triggerFileDownload,
  uploadMultipleFiles,
  uploadFile,
};

export default webDavFunctions;
