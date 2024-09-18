import { AppConfigDto } from '@libs/appconfig/types';
import AppConfigExtensions from '@libs/appconfig/extensions/types/appConfigExtensions';

const getExtendedOptionValue = (
  appConfigs: AppConfigDto[],
  appName: string,
  appExtensionName: string,
  appExtensionOptionsName: AppConfigExtensions,
): string | undefined => {
  const appConfig = appConfigs.find((config) => config.name === appName);
  const appExtensions = appConfig?.extendedOptions?.find((extension) => extension.name === appExtensionName);
  const option = appExtensions?.extensions.find((opt) => opt.name === appExtensionOptionsName);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return option ? (option.value as string) : undefined;
};

export default getExtendedOptionValue;
