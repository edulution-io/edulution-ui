const getLastPartOfUrl = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export default getLastPartOfUrl;
