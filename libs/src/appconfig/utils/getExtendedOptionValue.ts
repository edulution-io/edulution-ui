import { AppConfigDto } from '@libs/appconfig/types';
import { AppExtention } from '@libs/appconfig/constants/appExtention';
import { ExtendedOptions } from '@libs/appconfig/constants/appExtentionOptions';

const getExtendedOptionValue = (
  appConfigs: AppConfigDto[],
  extendedOptionsConfig: AppExtention,
  optionName: ExtendedOptions,
): string | undefined => {
  const validOptionNames = extendedOptionsConfig['ONLY_OFFICE'].map((item) => item.name);

  const appConfig = appConfigs.find(
    (config) => config.extendedOptions && config.extendedOptions.some((opt) => validOptionNames.includes(opt.name)),
  );

  if (appConfig && appConfig.extendedOptions) {
    const foundOption = appConfig.extendedOptions.find((opt) => opt.name === optionName);
    return foundOption?.value;
  }

  return undefined;
};

export default getExtendedOptionValue;
