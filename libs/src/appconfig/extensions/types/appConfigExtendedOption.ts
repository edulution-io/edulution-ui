import AppConfigExtensions from '@libs/appconfig/extensions/types/appConfigExtensions';

type Choices = { value: string; label: string }[];

export type ValueTypes = string | number | boolean | string[] | Choices;

type AppConfigExtendedOption = {
  name: AppConfigExtensions;
  width: 'full' | 'half';
  type: 'text' | 'number' | 'switch' | 'checkbox' | 'select';
  value: ValueTypes;
  defaultValue?: ValueTypes;
  choices?: Choices;
};

export default AppConfigExtendedOption;
