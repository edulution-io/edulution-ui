import { createClient } from 'webdav';
import JSZip from 'jszip';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';
import ApiResponseHandler from '@/utils/ApiResponseHandler';
import { translateKey } from '@/utils/common';
import { IWebDavFileManager } from './IWebDavFileManager';
import { DirectoryFile } from '../datatypes/filesystem';

function handleApiResponse(response: Response): { success: boolean; message: string; status: number } {
  return {
    success: true,
    message: response.statusText || translateKey('response.successfully'),
    status: response.status,
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

const client = createClient(`${window.location.origin}/webdav`, {
  username: import.meta.env.VITE_USERNAME as string,
  password: import.meta.env.VITE_PASSWORD as string,
});

const getContentList: IWebDavFileManager['getContentList'] = async (path: string): Promise<DirectoryFile[]> => {
  const result = await client.getDirectoryContents(path, {
    data:
      '<?xml version="1.0"?>\n' +
      '<d:propfind  xmlns:d="DAV:">\n' +
      '  <d:prop>\n' +
      '        <d:getlastmodified />\n' +
      '        <d:getetag />\n' +
      '        <d:getcontenttype />\n' +
      '        <d:getcontentlength />\n' +
      '        <d:displayname />\n' +
      '        <d:creationdate />\n' +
      '  </d:prop>\n' +
      '</d:propfind>',
  });
  if ('data' in result && Array.isArray(result.data)) {
    return result.data as DirectoryFile[];
  }
  return result as DirectoryFile[];
};

const createDirectory: IWebDavFileManager['createDirectory'] = async (path: string) => {
  try {
    await client.createDirectory(path);
    const response = new Response('OK', {
      status: 200,
      statusText: translateKey('response.directory_created_successfully', { directoryName: getFileNameFromPath(path) }),
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const createFile: IWebDavFileManager['createFile'] = async (path: string) => {
  try {
    await client.putFileContents(path, ' ');
    const response = new Response('OK', {
      status: 200,
      statusText: translateKey('response.file_created_successfully', { fileName: getFileNameFromPath(path) }),
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const deleteItem: IWebDavFileManager['deleteItem'] = async (path: string) => {
  try {
    await client.deleteFile(path);
    const response = new Response('OK', {
      status: 200,
      statusText: translateKey('response.file_was_deleted_successfully', { fileName: getFileNameFromPath(path) }),
    });
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const moveFile = async (
  sourcePath: string,
  destinationPath: string,
): Promise<{ success: boolean; message: string; status: number }> => {
  try {
    const response = await client.customRequest(sourcePath, {
      method: 'MOVE',
      headers: { Destination: `${destinationPath}` },
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: translateKey('response.move_successful', {
          sourcePath: getFileNameFromPath(sourcePath),
          destinationPath,
        }),
        status: response.status,
      };
    }
    return { success: false, message: translateKey('move_failed'), status: response.status };
  } catch (error) {
    let errorMessage = translateKey('response.unexpected_error_occurred');
    let errorCode = 500;
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('status' in error && typeof error.status === 'number') {
        errorCode = error.status;
      }
    }
    return {
      success: false,
      message: errorMessage,
      status: errorCode,
    };
  }
};

const renameItem: IWebDavFileManager['renameItem'] = async (path: string, toPath: string) => {
  try {
    return await moveFile(path, toPath);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

// TODO nice to have: moveFile should be supported with fullPath

const moveItems: IWebDavFileManager['moveItems'] = async (
  items: DirectoryFile[] | DirectoryFile,
  toPath: string | undefined,
) => {
  if (!toPath) {
    return { success: false, message: translateKey('response.destination_path_is_undefined'), status: 400 };
  }

  let results: Array<{ success: boolean; message: string; status: number }>;
  if (Array.isArray(items)) {
    const movePromises = items.map((item) => {
      const destination = `${toPath}/${getFileNameFromPath(item.filename)}`;
      return moveFile(item.filename, destination);
    });
    results = await Promise.all(movePromises);
  } else {
    const destination = `${toPath}/${getFileNameFromPath(items.filename)}`;
    results = [await moveFile(items.filename, destination)];
  }

  const failed = results.find((result) => !result.success);
  return failed
    ? { ...failed }
    : { success: true, message: translateKey('response.all_items_moved_successfully'), status: 200 };
};

const uploadFile: IWebDavFileManager['uploadFile'] = (
  file: File,
  remotePath: string,
  onProgress: (percentage: number) => void,
) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', client.getFileUploadLink(remotePath), true);

    xhr.setRequestHeader(
      'Authorization',
      `Basic ${btoa(`${import.meta.env.VITE_USERNAME}:${import.meta.env.VITE_PASSWORD}`)}`,
    );
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(
          handleApiResponse(
            new Response('OK', {
              status: 200,
              statusText: translateKey('response.file_uploaded_successfully', { fileName: file.name }),
            }),
          ),
        );
      } else {
        reject(new Error(translateKey('response.upload_failed_with_status', { status: xhr.status })));
      }
    };

    xhr.onerror = () => {
      reject(new Error(translateKey('response.network_error_occurred_during_the_upload')));
    };

    xhr.send(file);
  });

const uploadMultipleFiles: IWebDavFileManager['uploadMultipleFiles'] = (
  files: File[],
  remotePath: string,
  updateUI: (file: File, progress: number) => void,
) => {
  const uploadPromises = files.map((file) => {
    const filePath = `${remotePath}/${file.name}`;
    return uploadFile(file, filePath, (progress) => updateUI(file, progress)).catch((error) => ({
      success: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      message: translateKey('response.file_uploaded_failed', { fileName: file.name, status: error.message as string }),
    }));
  });

  return Promise.all(uploadPromises);
};

const addItemsToZip = async (zip: JSZip, path: string) => {
  const folderName = path.split('/').filter(Boolean).pop() || 'Folder';

  const folderZip = zip.folder(folderName);
  const contentList = await getContentList(path);
  try {
    const operations = contentList.map(async (item) => {
      if (item.type === 'file') {
        try {
          const result = await client.getFileContents(`${item.filename}`, { format: 'binary' });

          if (typeof result === 'string' || result instanceof ArrayBuffer || ArrayBuffer.isView(result)) {
            if (folderZip != null) {
              folderZip.file(item.basename, result);
            }
          } else if (result instanceof Blob && folderZip != null) {
            folderZip.file(item.basename, result);
          } else if (typeof result === 'object' && result !== null && 'data' in result && folderZip != null) {
            const { data } = result;
            if (typeof data === 'string' || ArrayBuffer.isView(data)) {
              zip.file(item.basename, data);
            } else {
              console.error(`Unsupported data type within ResponseDataDetailed for file: ${item.filename}`);
            }
          } else {
            console.error(`Unsupported data type for file: ${item.filename}`);
          }
        } catch (error) {
          console.error(`Error fetching file content for ${item.filename}:`, error);
        }
        return null;
      }
      if (item.type === 'directory') {
        const folderPath = `${path}/${item.basename}`;
        const folder = zip.folder(item.basename);
        if (folder !== null) {
          return addItemsToZip(folder, folderPath);
        }
        return null;
      }
      return null;
    });

    await Promise.all(operations);
  } catch (error) {
    console.error('Error processing content list:', error);
  }
};

const triggerFileDownload: IWebDavFileManager['triggerFileDownload'] = (path: string) => {
  const downloadLink = client.getFileDownloadLink(path);
  const anchor = document.createElement('a');
  anchor.href = downloadLink;
  anchor.setAttribute(getFileNameFromPath(path), '');
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// TODO move it later to backend or to lmn server
const triggerFolderDownload: IWebDavFileManager['triggerFolderDownload'] = async (path: string) => {
  const zip = new JSZip();
  await addItemsToZip(zip, path);

  await zip.generateAsync({ type: 'blob' }).then((content: Blob | MediaSource) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileNameFromPath(path);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};

// TODO move it later to backend or to lmn server
const triggerMultipleFolderDownload: IWebDavFileManager['triggerMultipleFolderDownload'] = async (
  folders: DirectoryFile[],
) => {
  const zip = new JSZip();
  try {
    const addItemsPromises = folders.map((folder) => addItemsToZip(zip, folder.filename));
    await Promise.all(addItemsPromises);
  } catch (error) {
    console.error('Error adding items to zip:', error);
  }
  await zip.generateAsync({ type: 'blob' }).then((content: Blob | MediaSource) => {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
};

const webDavFunctions: IWebDavFileManager = {
  getContentList,
  createDirectory,
  createFile,
  deleteItem,
  moveItems,
  renameItem,
  triggerFileDownload,
  triggerFolderDownload,
  triggerMultipleFolderDownload,
  uploadMultipleFiles,
  uploadFile,
};

export default webDavFunctions;
