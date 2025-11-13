import { UploadFile } from '@libs/filesharing/types/uploadFile';

const calculateTotalFilesAndBytes = (files: UploadFile[]): { filesCount: number; bytesCount: number } => {
  let filesCount = 0;
  let bytesCount = 0;

  files.forEach((file) => {
    if (file.isFolder && file.files) {
      filesCount += file.files.length;
      file.files.forEach((innerFile) => {
        bytesCount += innerFile.size;
      });
    } else {
      filesCount += 1;
      bytesCount += file.size;
    }
  });

  return { filesCount, bytesCount };
};

export default calculateTotalFilesAndBytes;
