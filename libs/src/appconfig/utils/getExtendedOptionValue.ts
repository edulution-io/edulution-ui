import { AppConfigDto } from '@libs/appconfig/types';
import AppConfigExtensions from '@libs/appconfig/types/appConfigExtensions';

const getExtendedOptionValue = (
  appConfigs: AppConfigDto[],
  appName: string,
  appExtensionName: string,
  appExtensionOptionsName: AppConfigExtensions,
): string | undefined => {
  const appConfig = appConfigs.find((config) => config.name === appName);
  if (!appConfig) return undefined;

  const appExtensions = appConfig.extendedOptions?.find((extension) => extension.name === appExtensionName);
  if (!appExtensions) return undefined;

  const option = appExtensions.extensions.find((opt) => opt.name === appExtensionOptionsName);

  return option?.value as string | undefined;
};

export default getExtendedOptionValue;
