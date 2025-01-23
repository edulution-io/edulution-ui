import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

const isFileValid = (file: DirectoryFileDTO | null): boolean => {
  if (!file) {
    return false;
  }
  const extension = getFileExtension(file.filename);
  return isOnlyOfficeDocument(file.filename) || isImageExtension(extension) || isVideoExtension(extension);
};

export default isFileValid;
