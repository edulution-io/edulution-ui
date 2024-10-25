import { AppConfigDto } from '@libs/appconfig/types';
import AppConfigExtensions from '@libs/appconfig/types/appConfigExtensions';

const getExtendedOptionValue = (
  appConfigs: AppConfigDto[],
  appName: string,
  appExtensionName: string,
  appExtensionOptionsName: AppConfigExtensions,
): string | number | boolean | undefined => {
  const appConfig = appConfigs.find((config) => config.name === appName);
  if (!appConfig) return undefined;

  const appExtensions = appConfig.extendedOptions?.find((extension) => extension.name === appExtensionName);
  if (!appExtensions) return undefined;

  const option = appExtensions.options.find((opt) => opt.name === appExtensionOptionsName);
  switch (option?.type) {
    case 'text':
      return option?.value as string;
    case 'number':
      return option?.value as number;
    case 'boolean':
      return option?.value as boolean;
    default:
      return undefined;
  }
};

export default getExtendedOptionValue;
