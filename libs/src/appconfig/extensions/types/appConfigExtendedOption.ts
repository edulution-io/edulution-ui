import AppConfigExtensions from '@libs/appconfig/extensions/types/appConfigExtensions';

type AppConfigExtendedOption = {
  name: AppConfigExtensions;
  width: 'full' | 'half';
  type: 'text' | 'number' | 'switch' | 'select' | 'checkbox';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  choices?: { value: string; label: string }[];
};

export default AppConfigExtendedOption;
