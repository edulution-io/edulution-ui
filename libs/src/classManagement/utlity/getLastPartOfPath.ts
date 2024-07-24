const getLastPartOfPath = (path: string) => {
  const lastSlashIndex = path.lastIndexOf('/');
  return path.substring(lastSlashIndex + 1);
};

export default getLastPartOfPath;
