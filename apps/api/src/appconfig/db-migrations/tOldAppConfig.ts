import { AppIntegrationType } from '@libs/appconfig/types';

export type TOldExtendedOption = {
  name: string;
  value: string;
  title: string;
  description: string;
  type: string;
};

type TOldAppConfig = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  accessGroups: { id: string; value: string; name: string; path: string; label: string }[];
  options: Record<string, string>;
  extendedOptions: TOldExtendedOption[];
};

export default TOldAppConfig;
