import buildBasePath from '@libs/filesharing/utils/buildBasePath';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import getPathWithoutRole from '@libs/filesharing/utils/getPathWithoutRole';

const buildSharePath = (role: string, studentName: string, schoolclass: string, fileName: string): string => {
  const basePath = buildBasePath(role, schoolclass);
  const pathWithoutWebDav = getPathWithoutWebdav(fileName);
  const cleanFileName = getPathWithoutRole(pathWithoutWebDav);
  return `${basePath}/${studentName}/transfer/${cleanFileName}`;
};

export default buildSharePath;
