import OnlyOfficeConfig from '@libs/filesharing/types/OnlyOfficeConfig';
import OnlyOfficeEditorConfig from '@libs/filesharing/types/OnlyOfficeEditorConfig';

interface OnlyOfficeConfigProps {
  fileType: string;
  type: 'desktop' | 'mobile';
  editorType: OnlyOfficeConfig;
  documentTitle: string;
  documentUrl: string;
  callbackUrl: string;
  mode: 'view' | 'edit';
  username: string;
  lang: string;
}

const generateOnlyOfficeConfig = ({
  fileType,
  type,
  editorType: { documentType, key },
  documentTitle,
  documentUrl,
  callbackUrl,
  mode,
  lang,
}: OnlyOfficeConfigProps): OnlyOfficeEditorConfig => ({
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
    lang,
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
      zoom: mode === 'view' ? 50 : 100,
    },
  },
});

export default generateOnlyOfficeConfig;
