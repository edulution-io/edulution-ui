import { TAppField } from '@libs/appconfig/types/tAppField';
import { TAppFieldName } from '@libs/appconfig/types/tAppFieldName';
import TAppFieldWidth from '@libs/appconfig/types/tAppFieldWidth';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';

export type Choices = { value: string; label: string }[];

export type AppConfigField = {
  type: TAppField;
  name: TAppFieldName;
  width: TAppFieldWidth;
  value: TAppFieldType;
  defaultValue?: TAppFieldType;
  choices?: Choices;
  color?: string;
};
