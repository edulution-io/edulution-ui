import OnlyOfficeDocumentTypes from '@libs/filesharing/types/OnlyOfficeDocumentTypes';

const isOnlyOfficeDocument = (filePath: string) =>
  Object.values(OnlyOfficeDocumentTypes).some((type) => filePath.includes(type));

export default isOnlyOfficeDocument;
