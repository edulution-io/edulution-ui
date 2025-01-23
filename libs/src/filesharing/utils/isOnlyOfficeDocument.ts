import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';

const isOnlyOfficeDocument = (filePath: string): boolean => {
  const fileExtension = filePath.split('.').pop()?.toLowerCase();

  return fileExtension
    ? Object.values(OnlyOfficeDocumentTypes)
        .map((t) => t.toString())
        .includes(fileExtension)
    : false;
};

export default isOnlyOfficeDocument;
