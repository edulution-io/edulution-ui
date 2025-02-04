// This Interface is based on a config definition from OnlyOffice.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

interface OnlyOfficeEditorConfig {
  document: {
    fileType: string;
    type: 'desktop' | 'mobile';
    key: string;
    title: string;
    url: string;
    height: string;
    width: string;
  };
  documentType: string;
  token: string;
  editorConfig: {
    lang: string;
    mode: 'view' | 'edit';
    callbackUrl: string;
    customization: {
      mentionShare: boolean;
      macros: boolean;
      autosave: boolean;
      comments: boolean;
      uiTheme: string;
      compactToolbar: boolean;
      plugins: boolean;
      forcesave: boolean;
      toolbarNoTabs: boolean;
      zoom: number;
      integrationMode: string;
      compatibleFeatures: boolean;
      help: boolean;
      compactHeader: boolean;
      unit: string;
      hideRightMenu: boolean;
      anonymous: { request: boolean; label: string };
      mobileForceView: boolean;
      macrosMode: string;
      hideRulers: boolean;
      toolbarHideFileName: boolean;
    };
  };
}

export default OnlyOfficeEditorConfig;
