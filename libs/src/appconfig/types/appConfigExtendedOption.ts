import { HTMLInputTypeAttribute } from 'react';
import AppConfigExtensions from '@libs/appconfig/types/appConfigExtensions';

type Choices = { value: string; label: string }[];

export type ValueTypes = string | number | boolean | string[] | Choices;

type AppConfigExtendedOption = {
  name: AppConfigExtensions;
  width: 'full' | 'half';
  type: HTMLInputTypeAttribute;
  value: ValueTypes;
  defaultValue?: ValueTypes;
  choices?: Choices;
};

export default AppConfigExtendedOption;
