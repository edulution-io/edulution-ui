import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';
import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case OnlyOfficeDocumentTypes.DOC:
    case OnlyOfficeDocumentTypes.DOCX:
      return { id: 'docxEditor', key: `${OnlyOfficeDocumentTypes.DOCX}${Math.random() * 100}`, documentType: 'word' };
    case OnlyOfficeDocumentTypes.XLSX:
    case OnlyOfficeDocumentTypes.CSV:
      return { id: 'xlsxEditor', key: `${OnlyOfficeDocumentTypes.XLSX}${Math.random() * 100}`, documentType: 'cell' };
    case OnlyOfficeDocumentTypes.PPTX:
      return { id: 'pptxEditor', key: `${OnlyOfficeDocumentTypes.PPTX}${Math.random() * 100}`, documentType: 'slide' };
    case OnlyOfficeDocumentTypes.PDF:
      return { id: 'pdfEditor', key: `${OnlyOfficeDocumentTypes.PDF}${Math.random() * 100}`, documentType: 'word' };
    default:
      return { id: 'docxEditor', key: `word${Math.random() * 100}`, documentType: 'word' };
  }
};

export default findDocumentsEditorType;
