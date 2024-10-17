import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildSharePath from '@libs/filesharing/utils/buildSharePath';

const buildShareDTO = (
  userName: string | undefined,
  students: UserLmnInfo[] | null,
  fileName: DirectoryFileDTO,
): DuplicateFileRequestDto | undefined => {
  if (!students) return undefined;

  const destinationFilePaths = students
    .map((student) => buildSharePath(userName || '', fileName.filename, student))
    .filter(Boolean);

  return {
    originFilePath: getPathWithoutWebdav(fileName.filename),
    destinationFilePaths,
  };
};

export default buildShareDTO;
