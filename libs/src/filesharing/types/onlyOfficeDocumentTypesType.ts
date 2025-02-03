import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';

export type TOnlyOfficeDocumentTypes = (typeof OnlyOfficeDocumentTypes)[keyof typeof OnlyOfficeDocumentTypes];
