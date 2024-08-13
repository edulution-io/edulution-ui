import { AppConfigDto } from '@libs/appconfig/types';
import { AppExtendedOptions, AppExtendedType } from '@libs/appconfig/types/appExtendedType';

const getExtendedOptionValue = (
  appConfigs: AppConfigDto[],
  extendedOptionsConfig: AppExtendedType,
  optionName: AppExtendedOptions,
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
