import { IconType } from 'react-file-icon';
import { translateKey } from '@/utils/common';

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
  '.drawio': 'vector',
};

export function getFileCategorie(filename: string): IconType {
  const extension = filename.split('.').pop();
  return contentFiletypes[`.${extension}`] ?? 'document';
}

export const parseDate = (value: unknown): Date | null => {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export function getFileNameFromPath(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

export function clearPathFromWebdav(path: string): string {
  return path.replace('/webdav', '');
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function getElapsedTime(dateParam: Date): string {
  if (!dateParam) {
    return translateKey('timeAgo.invalidDate');
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const TODAY = Date.now();
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  const difference = TODAY - date.getTime();

  if (difference < MINUTE) {
    return translateKey('timeAgo.justNow');
  }
  if (difference < HOUR) {
    return translateKey('timeAgo.minuteAgo', { count: Math.round(difference / MINUTE) });
  }
  if (difference < DAY) {
    return translateKey('timeAgo.hourAgo', { count: Math.round(difference / HOUR) });
  }
  if (difference < DAY * 7) {
    return translateKey('timeAgo.dayAgo', { count: Math.round(difference / DAY) });
  }
  return date.toLocaleDateString();
}

export default {
  getElapsedTime,
  parseDate,
  getFileCategorie,
};