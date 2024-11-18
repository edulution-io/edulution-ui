import {
  TAppFieldName,
  AppConfigSection,
  AppConfigField,
  TAppConfigSectionIMAP,
  TAppConfigSectionOnlyOffice,
  TAppField,
} from '@libs/appconfig/types';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import APP_CONFIG_SECTION_KEYS_IMAP from '@libs/appconfig/constants/appConfigSectionKeysIMAP';
import APP_CONFIG_SECTION_OPTIONS_IMAP from '@libs/appconfig/constants/appConfigSectionOptionsIMAP';
import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';
import APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionOptionsOnlyOffice';
import TAppFieldWidth from '@libs/appconfig/types/tAppFieldWidth';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';
import TOldAppConfig, { TOldExtendedOption } from './tOldAppConfig';

const createField = (
  name: TAppFieldName,
  type: TAppField = 'text',
  width: TAppFieldWidth = 'full',
  value: TAppFieldType = '',
): AppConfigField => ({ type, name, width, value });

function getGeneralSectionFromOptions(appConfigWithOldStructure: TOldAppConfig): AppConfigSection | undefined {
  const defaultGeneralSectionOptions = [
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.URL,
      type: 'text' as TAppField,
      width: 'full' as TAppFieldWidth,
      defaultValue: 'test/path',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
      type: 'text' as TAppField,
      width: 'full' as TAppFieldWidth,
      defaultValue: '123456789',
    },
    {
      name: APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
      type: TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG,
      width: 'full' as TAppFieldWidth,
      defaultValue: undefined,
    },
  ];

  const generalSectionOptions = defaultGeneralSectionOptions
    .filter(({ name }) => name in appConfigWithOldStructure.options)
    .map(({ name, type, width, defaultValue }) =>
      createField(name, type, width, appConfigWithOldStructure.options[name] || defaultValue),
    );
  if (generalSectionOptions.length > 0) {
    return {
      sectionName: APP_CONFIG_SECTIONS_NAME_GENERAL,
      options: generalSectionOptions,
    };
  }
  return undefined;
}

function getSectionsFromOldExtendedOptions(appConfigWithOldStructure: TOldAppConfig): AppConfigSection[] {
  const sectionMap = {
    [APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE.sectionName]: {
      keys: APP_CONFIG_SECTION_KEYS_ONLY_OFFICE,
      options: [] as AppConfigField[],
    },
    [APP_CONFIG_SECTION_OPTIONS_IMAP.sectionName]: {
      keys: APP_CONFIG_SECTION_KEYS_IMAP,
      options: [] as AppConfigField[],
    },
  };

  appConfigWithOldStructure.extendedOptions?.forEach((option: TOldExtendedOption) => {
    const field = createField(option.name, option.type === 'input' ? 'text' : option.type, 'full', option.value);

    Object.keys(sectionMap).forEach((sectionName) => {
      if (
        Object.values(sectionMap[sectionName].keys).includes(
          option.name as TAppConfigSectionIMAP | TAppConfigSectionOnlyOffice,
        )
      ) {
        sectionMap[sectionName].options.push(field);
      }
    });
  });

  return Object.entries(sectionMap)
    .filter(([, section]) => section.options.length > 0)
    .map(([sectionName, section]) => ({
      sectionName,
      options: section.options,
    }));
}
function reconstructOptionsAndExtendedOptions(appConfigWithOldStructure: TOldAppConfig): AppConfigSection[] {
  const generalSection = getGeneralSectionFromOptions(appConfigWithOldStructure);
  const otherSections = getSectionsFromOldExtendedOptions(appConfigWithOldStructure);

  return generalSection ? [generalSection, ...otherSections] : otherSections;
}

export default reconstructOptionsAndExtendedOptions;
