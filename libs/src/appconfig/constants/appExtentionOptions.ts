import { ExtendedOptions_OnlyOffice } from '@libs/appconfig/constants/appConfig-OnlyOffice';
import { ExtendedOptions_Imap } from '@libs/appconfig/constants/appConfig-IMAP';

export type ExtendedOptions = ExtendedOptions_OnlyOffice | ExtendedOptions_Imap;

export interface AppConfigExtendedOption {
  name: ExtendedOptions;
  title: string;
  description: string;
  type: string;
  value: string;
}
