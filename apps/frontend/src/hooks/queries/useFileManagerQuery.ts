import { DirectoryFile } from '@/datatypes/filesystem';
import axios from 'axios';

interface DownloadErrorResponse {
  success: boolean;
  status: number;
}

const useFileManagerQuery = () => {
  const EDU_API_ENDPOINT = 'filemanager';
  const eduApiUrl = 'http://localhost:5173/edu-api';
  const url = eduApiUrl + EDU_API_ENDPOINT;

  const fetchMountPoints = async (): Promise<DirectoryFile[]> => {
    try {
      const resp = await axios.get(`${url}/mountpoints`);
      return resp.data as DirectoryFile[];
    } catch (e) {
      return {} as DirectoryFile[];
    }
  };
  const fetchFilesFromPath = async (path: string): Promise<DirectoryFile[]> => {
    try {
      const resp = await axios.get(`${url}/filemanager/files/${path}`);
      return resp.data as DirectoryFile[];
    } catch (e) {
      return {} as DirectoryFile[];
    }
  };

  const addDirectory = async (
    path: string,
    folderName: string,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
    try {
      const resp = await axios.post(`${url}/createFolder/`, {
        path,
        folderName,
      });
      return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
    } catch (e) {
      return { success: false, status: 500 };
    }
  };

  const addFile = async (
    path: string,
    fileName: string,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
    try {
      const resp = await axios.put(`${url}/createFile/`, {
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

  const deleteFile = async (
    path: string,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
    try {
      const resp = await axios.delete(`${url}/delete/${path}`);
      return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
    } catch (e) {
      return { success: false, status: 500 };
    }
  };

  const uploadFiles = async (
    path: string,
    file: File,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
    try {
      const uploadPath = path.replace('/webdav/', '');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', uploadPath);
      const resp = await axios.put(`${url}/uploadFile`, formData);
      console.log(resp.data);
      return resp.status >= 200 && resp.status < 300 ? { success: true } : { success: false, status: resp.status };
    } catch (e) {
      console.log('Error uploading file:', e);
      return { success: false, status: 500, message: e.message };
    }
  };

  const changeFileName = async (
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

  const changeLocation = async (
    originPath: string,
    newPath: string,
  ): Promise<{ success: boolean; message: string; status: number } | { success: boolean }> => {
    try {
      const resp = await axios.put(
        `${url}/move/`,
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

  const downloadFile = async (path: string): Promise<string | DownloadErrorResponse> => {
    try {
      const resp = await axios.get(`${url}/download/${path.replace('/webdav/', '')}`);
      return resp.data as string;
    } catch (e) {
      return { success: false, status: 500 };
    }
  };
};

export default useFileManagerQuery;
