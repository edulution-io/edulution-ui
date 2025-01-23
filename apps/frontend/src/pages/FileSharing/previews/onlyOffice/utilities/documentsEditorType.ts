import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';
import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case OnlyOfficeDocumentTypes.DOC:
    case OnlyOfficeDocumentTypes.DOCX:
    case OnlyOfficeDocumentTypes.ODT:
    case OnlyOfficeDocumentTypes.DOT:
    case OnlyOfficeDocumentTypes.DOTX:
    case OnlyOfficeDocumentTypes.OTT:
    case OnlyOfficeDocumentTypes.RTF:
    case OnlyOfficeDocumentTypes.TXT:
    case OnlyOfficeDocumentTypes.XML:
    case OnlyOfficeDocumentTypes.HTML:
      return { id: 'docxEditor', key: `${OnlyOfficeDocumentTypes.DOCX}${Math.random() * 100}`, documentType: 'word' };

    case OnlyOfficeDocumentTypes.XLSX:
    case OnlyOfficeDocumentTypes.XLS:
    case OnlyOfficeDocumentTypes.XLT:
    case OnlyOfficeDocumentTypes.XLTX:
    case OnlyOfficeDocumentTypes.ODS:
    case OnlyOfficeDocumentTypes.OTS:
    case OnlyOfficeDocumentTypes.CSV:
      return { id: 'xlsxEditor', key: `${OnlyOfficeDocumentTypes.XLSX}${Math.random() * 100}`, documentType: 'cell' };

    case OnlyOfficeDocumentTypes.PPTX:
    case OnlyOfficeDocumentTypes.PPSX:
    case OnlyOfficeDocumentTypes.POTX:
    case OnlyOfficeDocumentTypes.PPT:
    case OnlyOfficeDocumentTypes.PPS:
    case OnlyOfficeDocumentTypes.POT:
    case OnlyOfficeDocumentTypes.OTP:
    case OnlyOfficeDocumentTypes.ODP:
      return { id: 'pptxEditor', key: `${OnlyOfficeDocumentTypes.PPTX}${Math.random() * 100}`, documentType: 'slide' };

    case OnlyOfficeDocumentTypes.PDF:
      return { id: 'pdfEditor', key: `${OnlyOfficeDocumentTypes.PDF}${Math.random() * 100}`, documentType: 'word' };

    default:
      return { id: 'docxEditor', key: `unknown${Math.random() * 100}`, documentType: 'word' };
  }
};

export default findDocumentsEditorType;
