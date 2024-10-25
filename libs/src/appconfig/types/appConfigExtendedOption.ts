import { HTMLInputTypeAttribute } from 'react';
import AppConfigExtensions from '@libs/appconfig/types/appConfigExtensions';

type Choices = { value: string; label: string }[];

type AppConfigExtendedOption = {
  name: AppConfigExtensions;
  width: 'full' | 'half';
  type: HTMLInputTypeAttribute;
  value: string | number | boolean;
  defaultValue?: string | number | boolean;
  choices?: Choices;
};

export default AppConfigExtendedOption;
