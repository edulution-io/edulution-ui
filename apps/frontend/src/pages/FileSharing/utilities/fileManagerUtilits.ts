import { IconType } from 'react-file-icon';

interface ContentFileTypes {
  [extension: string]: IconType | undefined;
}

const contentFiletypes: ContentFileTypes = {
  '.aac': 'audio',
  '.mp3': 'audio',
  '.abw': 'document',
  '.arc': 'compressed',
  '.zip': 'compressed',
  '.3gp': 'video',
  '.mp4': 'video',
  '.mov': 'video',
  '.3g2': 'video',
  '.7z': 'compressed',
  '.pdf': 'acrobat',
  '.doc': 'document',
  '.docx': 'document',
  '.ppt': 'presentation',
  '.pptx': 'presentation',
  '.xls': 'spreadsheet',
  '.xlsx': 'spreadsheet',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.svg': 'vector',
  '.js': 'code',
  '.java': 'code',
  '.py': 'code',
  '.cpp': 'code',
};

function getFileCategorie(filename: string): IconType {
  const extension = filename.split('.').pop();
  return contentFiletypes[`.${extension}`] ?? 'document';
}

export default getFileCategorie;
