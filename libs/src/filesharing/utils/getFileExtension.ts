const getFileExtension = (filename: string): string => {
  const extension = filename.split('.').pop();
  return extension || '';
};

export default getFileExtension;
