const getPathWithoutWebdav = (path: string): string => path.replace('/webdav/', '');

export default getPathWithoutWebdav;
