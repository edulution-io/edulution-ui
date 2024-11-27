import { AppConfigDto } from '@libs/appconfig/types';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const getExtendedOptions = (
  appConfigs: AppConfigDto[],
  settingLocation: string,
  key: ExtendedOptionKeys | string,
): string => {
  const appConfig = appConfigs.find((config) => config.name === settingLocation);

  if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
    return '';
  }
  const extendedOptionsArray = Object.entries(appConfig.extendedOptions || {});

  return extendedOptionsArray
    .filter(([k]) => k === key)
    .map(([, v]) => v)
    .join('');
};

export default getExtendedOptions;
