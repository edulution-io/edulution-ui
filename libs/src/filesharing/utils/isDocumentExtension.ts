import DocumentExtensions from '@libs/filesharing/constants/documentExtensions';

const isDocumentExtension = (extension: string | undefined): boolean =>
  Object.values(DocumentExtensions).includes(extension as DocumentExtensions);

export default isDocumentExtension;
