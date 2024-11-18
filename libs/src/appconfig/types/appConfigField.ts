import { TAppField } from '@libs/appconfig/types/tAppField';
import { TAppFieldName } from '@libs/appconfig/types/tAppFieldName';

export type Choices = { value: string; label: string }[];

export type AppConfigField = {
  type: TAppField;
  name: TAppFieldName;
  width: 'full' | 'half';
  value: string | number | boolean;
  defaultValue?: string | number | boolean;
  choices?: Choices;
  color?: string;
};
