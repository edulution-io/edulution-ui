import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';

interface OnlyOfficeConfigProps {
  fileType: string;
  type: 'desktop' | 'mobile';
  editorType: OnlyOfficeConfig;
  documentTitle: string;
  documentUrl: string;
  callbackUrl: string;
  mode: 'view' | 'edit';
  username: string;
}

const generateOnlyOfficeConfig = ({
  fileType,
  type,
  editorType: { documentType, key },
  documentTitle,
  documentUrl,
  callbackUrl,
  mode,
}: OnlyOfficeConfigProps) => ({
  document: {
    fileType,
    type,
    key,
    title: documentTitle,
    url: documentUrl,
    height: '100%',
    width: '100%',
  },
  documentType,
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
