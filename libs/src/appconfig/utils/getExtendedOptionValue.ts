import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { AppConfigDto } from '@libs/appconfig/types/appConfigDto';

const getExtendedOptions = (appConfigs: AppConfigDto[], settingLocation: string, key: ExtendedOptionKeys): string => {
  const appConfig = appConfigs.find((config) => config.name === settingLocation);

  if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
    return '';
  }

  return appConfig.extendedOptions[key] || '';
};

export default getExtendedOptions;
