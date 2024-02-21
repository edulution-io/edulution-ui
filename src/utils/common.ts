// utility.js
import i18n from '@/i18n'; // Path to your i18n configuration file

const translateKey = (key: string) => {
  return i18n.t(key); // Use i18next's `t` function directly
};

export type ValidateNameResult = {
    isValid: boolean;
    error: string;
};

function getFileNameFromPath(path: string): string {
    const segments = path.split('/');
    return segments[segments.length - 1]; // Access the last segment
}

function getPathWithoutFileName(path: string): string {
    const segments = path.split('/');
    segments.pop();
    return segments.join('/');
}


function getPrecedingPath(fullPath: string): string {
    const parts = fullPath.split("/").filter(Boolean);
    parts.pop();
    return `${fullPath.startsWith('/') ? '/' : ''}${parts.join("/")}`;
}


function validateDirectoryName(path: string): ValidateNameResult {
    const filename = getFileNameFromPath(path)
    if (/\s/.test(filename) && !(filename.length <= 0)) {
        return { isValid: false, error: 'Directory name should not contain spaces.' };
    } else if (filename.includes(".")) {
        return { isValid: false, error: 'Directory is not allowed to have a file extension' };
    } else {
        return { isValid: true, error: '' };
    }
}

function validateFileName(path: string): ValidateNameResult {
    const filename = getFileNameFromPath(path)
    if (/\s/.test(filename) && !(filename.length <= 0)) {
        return { isValid: false, error: 'File name should not contain spaces.' };
    } else if (!filename.endsWith('.txt')) {
        return { isValid: false, error: 'File name must end with .txt' };
    } else {
        return { isValid: true, error: '' };
    }
}


export { translateKey, getPathWithoutFileName ,getFileNameFromPath, validateFileName, validateDirectoryName, getPrecedingPath };
