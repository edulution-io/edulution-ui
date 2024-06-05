import axios from 'axios';
import { DirectoryFile } from '@/datatypes/filesystem.ts';

export const convertDownloadLinkToBlob = async (rawUrl: string): Promise<string | null> => {
  try {
    const response = await axios.get(rawUrl, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: response.data.type });
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error('Error fetching file URL:', error);
    return null;
  }
};

export const determinePreviewType = (file: DirectoryFile): string => {
  const extension = file.filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pptx':
    case 'xlsx':
    case 'docx':
    case 'txt':
    case 'pdf':
      return 'office';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'mp3':
    case 'mp4':
      return 'media';

    case 'drawio':
      return 'diagram';
    default:
      return 'unknown';
  }
};
