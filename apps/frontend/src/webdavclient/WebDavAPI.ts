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
