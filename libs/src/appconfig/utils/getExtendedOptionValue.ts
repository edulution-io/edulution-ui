import { AppConfigDto } from '@libs/appconfig/types/appConfigDto';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';

const getExtendedOptionsValue = (
  appConfigs: AppConfigDto[],
  settingLocation: string,
  key: ExtendedOptionKeysType,
): VeyonProxyItem[] | string => {
  const appConfig = appConfigs.find((config) => config.name === settingLocation);

  if (!appConfig || typeof appConfig.extendedOptions !== 'object') {
    return '';
  }

  return appConfig.extendedOptions[key] || '';
};

export default getExtendedOptionsValue;
