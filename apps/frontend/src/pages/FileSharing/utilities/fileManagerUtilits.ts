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

export function getFileCategorie(filename: string): IconType {
  const extension = filename.split('.').pop();
  return contentFiletypes[`.${extension}`] ?? 'document';
}

export function timeAgo(dateParam: Date): string {
  if (!dateParam) {
    return 'Invalid date';
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const TODAY = Date.now();
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  const difference = TODAY - date.getTime();

  if (difference < MINUTE) {
    return 'just now';
  }
  if (difference < HOUR) {
    return `${Math.round(difference / MINUTE)}m ago`;
  }
  if (difference < DAY) {
    return `${Math.round(difference / HOUR)}h ago`;
  }
  if (difference < DAY * 7) {
    return `${Math.round(difference / DAY)}d ago`;
  }
  return date.toLocaleDateString();
}

export default {
  getFileCategorie,
  timeAgo,
};
