import { AppConfigDto, TAppFieldName } from '@libs/appconfig/types';

const getAppConfigSectionFieldValue = (
  appConfigs: AppConfigDto[],
  appName: string,
  sectionName: string,
  fieldName: TAppFieldName,
): string | number | boolean | JSON | undefined => {
  const appConfig = appConfigs.find((config) => config.name === appName);
  if (!appConfig) return undefined;

  const appSection = appConfig.options?.find((options) => options.sectionName === sectionName);
  if (!appSection) return undefined;

  const field = appSection.options.find((option) => option.name === fieldName);
  switch (field?.type) {
    case 'text':
      return field?.value as string;
    case 'number':
      return field?.value as number;
    case 'boolean':
      return field?.value as boolean;
    // case 'proxyConfig':
    //   return field?.value as JSON;
    default:
      return undefined;
  }
};

export default getAppConfigSectionFieldValue;
