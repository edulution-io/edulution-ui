import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import extractCnValue from '@libs/common/utils/extractCnValue';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildSharePath from '@libs/filesharing/utils/buildSharePath';

const buildShareDTO = (
  students: UserLmnInfo[] | null,
  fileName: DirectoryFileDTO,
): DuplicateFileRequestDto | undefined => {
  if (!students) return undefined;

  const destinationFilePaths = students
    .map((s) => {
      const role = extractCnValue(s.memberOf[0]);
      if (!s.school || !s.schoolclasses || !s.schoolclasses[0]) {
        return null;
      }

      const { school } = s;
      const schoolclass = s.schoolclasses[0].replace(`${school}-`, '');
      return buildSharePath(role, s.cn, schoolclass, fileName.filename); // Build the path
    })
    .filter(Boolean) as string[];

  return {
    originFilePath: getPathWithoutWebdav(fileName.filename),
    destinationFilePaths,
  };
};

export default buildShareDTO;
