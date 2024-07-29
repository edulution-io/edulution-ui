import OnlyOfficeConfig from '@/pages/FileSharing/previews/onlyOffice/OnlyOfficeConfig';

const findDocumentsEditorType = (fileType: string): OnlyOfficeConfig => {
  switch (fileType) {
    case 'doc':
    case 'docx':
      return { id: 'docxEditor', key: `docx${Math.random() * 100}`, documentType: 'word' };
    case 'xlsx':
    case 'csv':
      return { id: 'xlsxEditor', key: `xlsx${Math.random() * 100}`, documentType: 'cell' };
    case 'pptx':
      return { id: 'pptxEditor', key: `pptx${Math.random() * 100}`, documentType: 'slide' };
    case 'pdf':
      return { id: 'pdfEditor', key: `pdf${Math.random() * 100}`, documentType: 'word' };
    default:
      return { id: 'docxEditor', key: `word${Math.random() * 100}`, documentType: 'word' };
  }
};

export default findDocumentsEditorType;
