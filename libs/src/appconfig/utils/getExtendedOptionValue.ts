import { AppConfigDto } from '@libs/appconfig/types/appConfigDto';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';

const getExtendedOptions = (
  appConfigs: AppConfigDto[],
  settingLocation: string,
  key: ExtendedOptionKeysType,
): string => {
  const appConfig = appConfigs.find((config) => config.name === settingLocation);

  if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
    return '';
  }

  return (appConfig.extendedOptions[key] as string) || '';
};

export default getExtendedOptions;
