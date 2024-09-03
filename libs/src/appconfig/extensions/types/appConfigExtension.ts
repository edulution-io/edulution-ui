import AppConfigExtensions from '@libs/appconfig/extensions/types/appConfigExtensions';

interface AppConfigExtension {
  name: AppConfigExtensions;
  title: string;
  description: string;
  type: string;
  value: string;
}

export default AppConfigExtension;
