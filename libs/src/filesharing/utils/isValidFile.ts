import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import isDocumentExtension from '@libs/filesharing/utils/isDocumentExtension';

const isValidFile = (file: DirectoryFileDTO | null): boolean => {
  if (!file) {
    return false;
  }
  const extension = getFileExtension(file.filename);
  return isDocumentExtension(extension) || isImageExtension(extension) || isVideoExtension(extension);
};

export default isValidFile;
