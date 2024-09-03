import AppConfigExtension from '@libs/appconfig/extensions/types/appConfigExtension';

interface AppExtension {
  [key: string]: AppConfigExtension[];
}

export default AppExtension;
