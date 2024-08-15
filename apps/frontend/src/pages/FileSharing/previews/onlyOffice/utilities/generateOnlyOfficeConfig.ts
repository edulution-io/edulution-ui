interface OnlyOfficeConfigProps {
  fileType: string;
  type: 'desktop' | 'mobile';
  editorConfigKey: string;
  documentTitle: string;
  documentUrl: string;
  callbackUrl: string;
  mode: 'view' | 'edit';
  username: string;
}

const getDocumentType = (editorConfigKey: string): string => {
  switch (true) {
    case editorConfigKey.includes('docx'):
      return 'word';
    case editorConfigKey.includes('xlsx'):
      return 'cell';
    default:
      return 'slide';
  }
};

const generateOnlyOfficeConfig = ({
  fileType,
  type,
  editorConfigKey,
  documentTitle,
  documentUrl,
  callbackUrl,
  mode,
}: OnlyOfficeConfigProps) => ({
  document: {
    fileType,
    type,
    key: editorConfigKey,
    title: documentTitle,
    url: documentUrl,
    height: '100%',
    width: '100%',
  },
  documentType: getDocumentType(editorConfigKey),
  token: '',
  editorConfig: {
    callbackUrl,
    mode,
    customization: {
      anonymous: {
        request: false,
        label: 'Guest',
      },
      autosave: true,
      comments: true,
      compactHeader: false,
      compactToolbar: false,
      compatibleFeatures: false,
      forcesave: false,
      help: true,
      hideRightMenu: false,
      hideRulers: false,
      integrationMode: 'embed',
      macros: true,
      macrosMode: 'Warn',
      mentionShare: false,
      mobileForceView: true,
      plugins: true,
      toolbarHideFileName: false,
      toolbarNoTabs: false,
      uiTheme: 'theme-dark',
      unit: 'cm',
      zoom: 100,
    },
  },
});

export default generateOnlyOfficeConfig;
