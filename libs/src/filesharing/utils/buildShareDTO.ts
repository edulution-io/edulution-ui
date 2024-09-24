import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import extractCnValue from '@libs/common/utils/extractCnValue';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildSharePath from '@libs/filesharing/utils/buildSharePath';

const buildShareDTO = (
  userName: string | undefined,
  students: UserLmnInfo[] | null,
  fileName: DirectoryFileDTO,
): DuplicateFileRequestDto | undefined => {
  if (!students) return undefined;

  const destinationFilePaths = students
    .map((student) => {
      const role = extractCnValue(student.memberOf[0]);
      if (!student.school || !student.schoolclasses || !student.schoolclasses[0]) {
        return null;
      }

      const { school } = student;
      const schoolclass = student.schoolclasses[0].replace(`${school}-`, '');
      return buildSharePath(userName || '', role, student.cn, schoolclass, fileName.filename);
    })
    .filter(Boolean) as string[];

  return {
    originFilePath: getPathWithoutWebdav(fileName.filename),
    destinationFilePaths,
  };
};

export default buildShareDTO;
