import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';
import { TOnlyOfficeDocumentTypes } from '@libs/filesharing/types/onlyOfficeDocumentTypesType';

const isOnlyOfficeDocument = (filePath: string): boolean => {
  const fileExtension = filePath.split('.').pop()?.toLowerCase() as TOnlyOfficeDocumentTypes;

  return fileExtension ? Object.values(OnlyOfficeDocumentTypes).includes(fileExtension) : false;
};

export default isOnlyOfficeDocument;
