import axios from 'axios';
import { DirectoryFile } from '@/datatypes/filesystem';

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
    return resp.status === 201 || resp.status === 204 ? { success: true } : { success: false, status: resp.status };
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
    return resp.status === 201 || resp.status === 204 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};

export const deleteFile = async (
  path: string,
): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
  try {
    const resp = await axios.delete(`http://localhost:3000/edu-api/filemanager/delete/${path}`);
    return resp.status === 204 ? { success: true } : { success: false, status: resp.status };
  } catch (e) {
    return { success: false, status: 500 };
  }
};
