const AVAILABLE_FILE_TYPES = {
  drawIo: {
    type: 'drawIoFile',
    extension: '.drawio',
    generate: 'drawio',
  },
  text: {
    type: 'textFile',
    extension: '.txt',
    generate: 'txt',
  },
  document: {
    type: 'documentFile',
    extension: '.docx',
    generate: 'docx',
  },
  spreadsheet: {
    type: 'spreadsheetFile',
    extension: '.xlsx',
    generate: 'xlsx',
  },
  presentation: {
    type: 'presentationFile',
    extension: '.pptx',
    generate: 'pptx',
  },
} as const;

export default AVAILABLE_FILE_TYPES;
