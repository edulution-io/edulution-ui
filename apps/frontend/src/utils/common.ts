import i18n from '@/i18n';

const translateKey = (key: string) => i18n.t(key);

export type ValidateNameResult = {
  isValid: boolean;
  error: string;
};

function getFileNameFromPath(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

function getPathWithoutFileName(path: string): string {
  const segments = path.split('/');
  segments.pop();
  return segments.join('/');
}

function getPrecedingPath(fullPath: string): string {
  const parts = fullPath.split('/').filter(Boolean);
  parts.pop();
  return `${fullPath.startsWith('/') ? '/' : ''}${parts.join('/')}`;
}

function validateDirectoryName(path: string): ValidateNameResult {
  const filename = getFileNameFromPath(path);
  if (/\s/.test(filename) && !(filename.length <= 0)) {
    return { isValid: false, error: 'Directory name should not contain spaces.' };
  }
  if (filename.includes('.')) {
    return { isValid: false, error: 'Directory is not allowed to have a file extension' };
  }
  return { isValid: true, error: '' };
}

function validateFileName(path: string): ValidateNameResult {
  const filename = getFileNameFromPath(path);
  if (/\s/.test(filename) && !(filename.length <= 0)) {
    return { isValid: false, error: 'File name should not contain spaces.' };
  }
  if (!filename.endsWith('.txt')) {
    return { isValid: false, error: 'File name must end with .txt' };
  }
  return { isValid: true, error: '' };
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function getFileType(fullPath: string): string {
  const parts = fullPath.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}

export {
  translateKey,
  getPathWithoutFileName,
  getFileNameFromPath,
  validateFileName,
  validateDirectoryName,
  getPrecedingPath,
  formatBytes,
  getFileType,
};
