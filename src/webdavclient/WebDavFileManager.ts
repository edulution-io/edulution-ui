import { createClient } from 'webdav';
import JSZip from 'jszip';
import { getFileNameFromPath } from '@/utils/common';
import ApiResponseHandler from '@/utils/ApiResponseHandler';
import { IWebDavFileManager } from './IWebDavFileManager';
import { DirectoryFile } from '../../datatypes/filesystem';

function handleApiResponse(response: Response): { success: boolean; message: string; status: number } {
  return {
    success: true,
    message: response.statusText || 'Action created successfully',
    status: response.status,
  };
}

const handleApiError = (error: Response) => {
  let status = 500;
  let statusText = 'Internal Server Error';
  if (error instanceof Error && 'status' in error) {
    status = typeof error.status === 'number' ? error.status : 500;
    statusText = error.message || 'Error';
  }
  return ApiResponseHandler.handleApiResponse(
    new Response(null, {
      status,
      statusText,
    }),
  );
};

const client = createClient('http://localhost:5173/webdav/', {
  username: 'netzint-teacher',
  password: 'Muster!',
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
      statusText: `Directory ${getFileNameFromPath(path)} created successfully`,
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
      statusText: `File ${getFileNameFromPath(path)} created successfully`,
    });
    console.log(response.statusText, response.status, response.url, response.type, response.bodyUsed, response.body);
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error as Response);
  }
};

const deleteItem: IWebDavFileManager['deleteItem'] = async (path: string) => {
  try {
    console.log('Deleting item:', path);
    await client.deleteFile(path);
    const response = new Response('OK', {
      status: 200,
      statusText: `File ${getFileNameFromPath(path)} was deleted successfully`,
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
        message: `Move successful ${getFileNameFromPath(sourcePath)} to ${destinationPath}`,
        status: response.status,
      };
    }
    return { success: false, message: 'Move failed', status: response.status };
  } catch (error) {
    let errorMessage = 'Unexpected error occurred';
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
    return { success: false, message: 'Destination path is undefined', status: 400 };
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
  return failed ? { ...failed } : { success: true, message: 'All items moved successfully', status: 200 };
};

const uploadFile: IWebDavFileManager['uploadFile'] = (file: File, remotePath: string) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          await client.putFileContents(remotePath, arrayBuffer, {
            overwrite: true,
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });
          console.log('File uploaded successfully');
          resolve(
            handleApiResponse(
              new Response('OK', { status: 200, statusText: `File ${file.name} uploaded successfully` }),
            ),
          );
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('An unknown error occurred'));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error(`Error reading file: ${reader.error?.message || 'Unknown error'}`));
    };
    reader.readAsArrayBuffer(file);
  });

const addItemsToZip = async (zip: JSZip, path: string) => {
  const folderName = path.split('/').filter(Boolean).pop() || 'Folder';

  const folderZip = zip.folder(folderName);
  const contentList = await getContentList(path);
  try {
    const operations = contentList.map(async (item) => {
      if (item.type === 'file') {
        try {
          const result = await client.getFileContents(`${item.filename}`, { format: 'binary' });
          console.log(`Result type for ${item.filename}:`, typeof result, ArrayBuffer.isView(result));

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
  console.log(downloadLink);
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
  uploadFile,
};

export default webDavFunctions;
