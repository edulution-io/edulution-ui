import buildUserPath from '@libs/filesharing/utils/buildUserPath';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import getPathWithoutRole from '@libs/filesharing/utils/getPathWithoutRole';
import FILE_PATHS from '../constants/file-paths';

const buildSharePath = (role: string, studentName: string, schoolclass: string, fileName: string): string => {
  const basePath = buildUserPath(role, schoolclass, studentName);
  const pathWithoutWebDav = getPathWithoutWebdav(fileName);
  const cleanFileName = getPathWithoutRole(pathWithoutWebDav);

  return `${basePath}/${FILE_PATHS.TRANSFER}/${cleanFileName}`;
};

export default buildSharePath;
