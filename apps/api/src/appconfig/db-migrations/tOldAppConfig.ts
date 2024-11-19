import { AppConfigField, AppIntegrationType, TAppFieldName } from '@libs/appconfig/types';

export type TOldExtendedOption = {
  name: TAppFieldName;
  value: string;
  title: string;
  description: string;
  type: string;
};

export type TOldExtendedOptions = {
  name: string;
  options: AppConfigField[];
};

type TOldAppConfig = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  accessGroups: { id: string; value: string; name: string; path: string; label: string }[];
  options: Record<string, string>;
  extendedOptions: TOldExtendedOption[] | TOldExtendedOptions[];
};

export default TOldAppConfig;
