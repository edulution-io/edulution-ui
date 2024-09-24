import buildUserPath from '@libs/filesharing/utils/buildUserPath';
import FILE_PATHS from '../constants/file-paths';

const buildSharePath = (
  userName: string,
  role: string,
  studentName: string,
  schoolclass: string,
  fileName: string,
): string => {
  const homePath = buildUserPath(role, schoolclass, studentName);
  const file = fileName.split('/').pop();

  return `${homePath}/${FILE_PATHS.TRANSFER}/${userName}/${file}`;
};

export default buildSharePath;
