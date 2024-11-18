import {
  TAppFieldName,
  AppConfigSection,
  AppConfigField,
  TAppConfigSectionIMAP,
  TAppConfigSectionOnlyOffice,
} from '@libs/appconfig/types';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import APP_CONFIG_SECTION_KEYS_IMAP from '@libs/appconfig/constants/appConfigSectionKeysIMAP';
import APP_CONFIG_SECTION_OPTIONS_IMAP from '@libs/appconfig/constants/appConfigSectionOptionsIMAP';
import APP_CONFIG_SECTION_KEYS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionKeysOnlyOffice';
import APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionOptionsOnlyOffice';
import TOldAppConfig, { TOldExtendedOption } from './tOldAppConfig';

function reconstructOptionsAndExtendedOptions(appConfigWithOldStructure: TOldAppConfig): AppConfigSection[] {
  const options: AppConfigSection[] = [];
  const generalSectionOptions: AppConfigField[] = [];

  if (Object.keys(appConfigWithOldStructure.options).includes(APP_CONFIG_SECTION_KEYS_GENERAL.URL)) {
    generalSectionOptions.push({
      type: 'text',
      name: APP_CONFIG_SECTION_KEYS_GENERAL.URL,
      width: 'full',
      value: appConfigWithOldStructure.options[APP_CONFIG_SECTION_KEYS_GENERAL.URL] || 'test/path',
    });
  }
  if (Object.keys(appConfigWithOldStructure.options).includes(APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY)) {
    generalSectionOptions.push({
      type: 'text',
      name: APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY,
      width: 'full',
      value: appConfigWithOldStructure.options[APP_CONFIG_SECTION_KEYS_GENERAL.APIKEY] || '123456789',
    });
  }
  if (Object.keys(appConfigWithOldStructure.options).includes(APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG)) {
    generalSectionOptions.push({
      type: TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG,
      name: APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
      width: 'full',
      value: appConfigWithOldStructure.options[APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG],
    });
  }
  if (generalSectionOptions.length > 0) {
    options.push({
      sectionName: APP_CONFIG_SECTIONS_NAME_GENERAL,
      options: generalSectionOptions,
    });
  }

  const onlyOfficeSectionOptions: AppConfigField[] = [];
  const imapSectionOptions: AppConfigField[] = [];
  if (appConfigWithOldStructure.extendedOptions) {
    appConfigWithOldStructure.extendedOptions.forEach((option: TOldExtendedOption) => {
      const newField: AppConfigField = {
        type: option.type === 'input' ? 'text' : option.type,
        name: option.name as TAppFieldName,
        width: 'full',
        value: option.value,
      };
      if (Object.values(APP_CONFIG_SECTION_KEYS_ONLY_OFFICE).includes(option.name as TAppConfigSectionOnlyOffice)) {
        onlyOfficeSectionOptions.push(newField);
      }
      if (Object.values(APP_CONFIG_SECTION_KEYS_IMAP).includes(option.name as TAppConfigSectionIMAP)) {
        imapSectionOptions.push(newField);
      }
    });
  }
  if (onlyOfficeSectionOptions.length > 0) {
    options.push({
      sectionName: APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE.sectionName,
      options: onlyOfficeSectionOptions,
    });
  }
  if (imapSectionOptions.length > 0) {
    options.push({
      sectionName: APP_CONFIG_SECTION_OPTIONS_IMAP.sectionName,
      options: imapSectionOptions,
    });
  }

  return options;
}

export default reconstructOptionsAndExtendedOptions;
