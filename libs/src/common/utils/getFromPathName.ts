const getFromPathName = (pathname: string, index: number | number[]): string => {
  const parts = pathname.split('/');

  if (Array.isArray(index)) {
    return index.map((i) => parts[i]).join('/');
  }

  return parts[index];
};

export default getFromPathName;
