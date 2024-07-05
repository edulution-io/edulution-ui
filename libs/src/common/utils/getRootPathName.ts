import getFromPathName from './getFromPathName';

const getRootPathName = (pathname: string): string => getFromPathName(pathname, [0, 1]);
export default getRootPathName;
