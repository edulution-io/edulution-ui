import axios from 'axios';
import { DirectoryFile } from '@/datatypes/filesystem';

interface DownloadErrorResponse {
  success: boolean;
  status: number;
}

export const fetchMountPoints = async (): Promise<DirectoryFile[]> => {
  try {
    const resp = await axios.get('http://localhost:3000/edu-api/filemanager/mountpoints');
    return resp.data as DirectoryFile[];
  } catch (e) {
    return {} as DirectoryFile[];
  }
};
export const fetchFilesFromPath = async (path: string): Promise<DirectoryFile[]> => {
  try {
    const resp = await axios.get(`http://localhost:3000/edu-api/filemanager/files/${path}`);
    return resp.data as DirectoryFile[];
  } catch (e) {
    return {} as DirectoryFile[];
  }
};

export const addDirectory = async (
  path: string,
  folderName: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const resp = await axios.post(`http://localhost:3000/edu-api/filemanager/createFolder/`, {
      path,
      folderName,
    });
    return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const addFile = async (
  path: string,
  fileName: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const resp = await axios.put(`http://localhost:3000/edu-api/filemanager/createFile/`, {
      path,
      fileName,
      content: 'Some content here',
    });
    console.log(resp.data);
    return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const deleteFile = async (
  path: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const resp = await axios.delete(`http://localhost:3000/edu-api/filemanager/delete/${path}`);
    return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const uploadFiles = async (
  path: string,
  file: File,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const uploadPath = path.replace('/webdav/', '');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', uploadPath);
    const resp = await axios.put(`http://localhost:3000/edu-api/filemanager/uploadFile`, formData);
    console.log(resp.data);
    return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    console.log('Error uploading file:', e);
    return { success: false, status: 500, message: e.message };
  }
};

export const changeFileName = async (
  path: string,
  newName: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  const pathWithoutWebDav = path.replace('/webdav/', '');
  const newNameWithoutWebDav = newName.replace('/webdav/', '');

  try {
    const resp = await axios.put(
      `http://localhost:3000/edu-api/filemanager/rename/`,
      {
        path: pathWithoutWebDav,
        newName: newNameWithoutWebDav,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return resp.status >= 200 && resp.status <= 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const changeLocation = async (
  originPath: string,
  newPath: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const resp = await axios.put(
      `http://localhost:3000/edu-api/filemanager/move/`,
      {
        originPath,
        newPath,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const downloadFile = async (path: string): Promise<string | DownloadErrorResponse> => {
  try {
    const resp = await axios.get(`http://localhost:3000/edu-api/filemanager/download/${path.replace('/webdav/', '')}`);
    return resp.data as string;
  } catch (e) {
    return { success: false, status: 500 };
  }
};
