/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import APP_CONFIG_OPTIONS from '@/pages/Settings/AppConfig/appConfigOptions';
import type { AppConfigOptionsType } from '@libs/appconfig/types/appConfigOptionsType';
import useLanguage from '@/hooks/useLanguage';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { MailProviderConfigDto } from '@libs/mail/types';
import APP_CONFIG_OPTION_KEYS from '@libs/appconfig/constants/appConfigOptionKeys';
import ExtendedOptionsForm from '@/pages/Settings/AppConfig/components/ExtendedOptionsForm';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import APPS from '@libs/appconfig/constants/apps';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import getDisplayName from '@/utils/getDisplayName';
import PageLayout from '@/components/structure/layout/PageLayout';
import type AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import AppConfigDropdownSelect from '@/pages/Settings/AppConfig/components/AppConfigDropdownSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailImporterConfig from './mails/MailImporterConfig';
import getAppConfigFormSchema from './schemas/getAppConfigFormSchema';
import ProxyConfigForm from './components/ProxyConfigForm';

interface AppConfigPageProps {
  settingLocation: string;
}

const AppConfigPage: React.FC<AppConfigPageProps> = ({ settingLocation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, getAppConfigs, setIsDeleteAppConfigDialogOpen, updateAppConfig, deleteAppConfigEntry } =
    useAppConfigsStore();
  const { searchGroups } = useGroupStore();
  const { postExternalMailProviderConfig } = useMailsStore();
  const { language } = useLanguage();

  const form = useForm<{ [settingLocation: string]: AppConfigDto } | ProxyConfigFormType | MailProviderConfig>({
    mode: 'onSubmit',
    resolver: zodResolver(getAppConfigFormSchema(t)),
  });

  useEffect(() => {
    void getAppConfigs();
  }, []);

  const { control, handleSubmit, setValue, getValues, clearErrors } = form;

  const updateSettings = () => {
    const currentConfig = findAppConfigByName(appConfigs, settingLocation);
    if (!currentConfig) {
      return;
    }

    clearErrors();

    setValue(`${settingLocation}.appType`, currentConfig.appType);
    setValue(`${settingLocation}.position`, currentConfig.position);
    setValue(`${settingLocation}.accessGroups`, currentConfig.accessGroups || []);
    setValue(`${settingLocation}.extendedOptions`, currentConfig.extendedOptions || {});

    if (currentConfig.options) {
      Object.keys(currentConfig.options).forEach((key) => {
        if (key === APP_CONFIG_OPTION_KEYS.PROXYCONFIG) {
          const proxyConfig = JSON.parse(currentConfig?.options[key] || JSON.stringify({})) as string;
          setValue(`${settingLocation}.proxyConfig`, proxyConfig);
        } else {
          setValue(
            `${settingLocation}.options.${key as AppConfigOptionsType}`,
            currentConfig.options[key as AppConfigOptionsType],
          );
        }
      });
    }
  };

  useEffect(() => {
    updateSettings();
  }, [settingLocation, appConfigs]);

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[], fieldName: string) => {
    const currentGroups = getValues(`${fieldName}.accessGroups`) || [];

    const filteredCurrentGroups = currentGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );
    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];
    setValue(`${fieldName}.accessGroups`, combinedGroups, { shouldValidate: true });
  };

  const onSubmit = async () => {
    const selectedAppConfig = findAppConfigByName(appConfigs, settingLocation);
    if (!selectedAppConfig) {
      return;
    }

    const proxyConfig = JSON.stringify(getValues(`${settingLocation}.proxyConfig`)) || '""';

    const options = {
      url: Object.keys(selectedAppConfig?.options).includes(APP_CONFIG_OPTION_KEYS.URL)
        ? getValues(`${settingLocation}.options.url`)
        : undefined,
      apiKey: Object.keys(selectedAppConfig?.options).includes(APP_CONFIG_OPTION_KEYS.APIKEY)
        ? getValues(`${settingLocation}.options.apiKey`)
        : undefined,
      proxyConfig: Object.keys(selectedAppConfig?.options).includes(APP_CONFIG_OPTION_KEYS.PROXYCONFIG)
        ? proxyConfig
        : undefined,
    };
    const extendedOptions = form.getValues(`${settingLocation}.extendedOptions`) || {};

    const newConfig = {
      ...selectedAppConfig,
      options,
      extendedOptions,
      accessGroups: getValues(`${settingLocation}.accessGroups`) || [],
      position: getValues(`${settingLocation}.position`),
    };

    await updateAppConfig(newConfig);

    if (settingLocation === APPS.MAIL && getValues('mail.configName')) {
      const mailProviderConfig: MailProviderConfigDto = {
        id: getValues('mail.mailProviderId') || '',
        name: getValues('mail.configName'),
        label: getValues('mail.configName'),
        host: getValues('mail.hostname'),
        port: getValues('mail.port'),
        encryption: getValues('mail.encryption'),
      };
      void postExternalMailProviderConfig(mailProviderConfig);
    }
  };

  const matchingConfig = appConfigs.find((item) => item.name === settingLocation);
  const isSupportedAppType = (appType: AppIntegrationType): appType is 'native' | 'embedded' =>
    ['native', 'embedded'].includes(appType);

  const getSettingsForm = () => (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="column max-w-screen-2xl space-y-6"
      >
        {matchingConfig && (
          <div className="m-5 space-y-3">
            <AppConfigDropdownSelect
              form={form}
              appConfig={matchingConfig}
            />
            <FormFieldSH
              key={`${matchingConfig.name}.accessGroups`}
              control={control}
              name={`${matchingConfig.name}.accessGroups`}
              render={() => (
                <FormItem>
                  <h4 className="text-background">{t(`permission.groups`)}</h4>
                  <FormControl>
                    <AsyncMultiSelect<MultipleSelectorGroup>
                      value={getValues(`${matchingConfig.name}.accessGroups`)}
                      onSearch={searchGroups}
                      onChange={(groups) => handleGroupsChange(groups, `${matchingConfig.name}`)}
                      placeholder={t('search.type-to-search')}
                    />
                  </FormControl>
                  <p className="text-background">{t(`permission.selectGroupsDescription`)}</p>
                  <FormMessage className="text-p" />
                </FormItem>
              )}
            />
            {matchingConfig.extendedOptions && isSupportedAppType(matchingConfig.appType) ? (
              <ExtendedOptionsForm
                extendedOptions={
                  APP_CONFIG_OPTIONS.find((itm) => itm.id === settingLocation || itm.id === APPS.EMBEDDED)
                    ?.extendedOptions
                }
                control={control}
                settingLocation={settingLocation}
                form={form}
              />
            ) : null}
            {Object.keys(matchingConfig.options)
              .filter((key) => key === APP_CONFIG_OPTION_KEYS.URL || key === APP_CONFIG_OPTION_KEYS.APIKEY)
              .map((filteredKey) => (
                <FormFieldSH
                  key={`${matchingConfig.name}.options.${filteredKey}`}
                  control={control}
                  name={`${matchingConfig.name}.options.${filteredKey}`}
                  defaultValue={filteredKey}
                  render={({ field }) => (
                    <FormItem>
                      <h4 className="text-background">{t(`form.${filteredKey}`)}</h4>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
              ))}
            {APP_CONFIG_OPTION_KEYS.PROXYCONFIG in matchingConfig.options && (
              <ProxyConfigForm
                key={`${matchingConfig.name}.options.${APP_CONFIG_OPTION_KEYS.PROXYCONFIG}`}
                item={matchingConfig}
                form={form as UseFormReturn<ProxyConfigFormType>}
              />
            )}
            {settingLocation === APPS.MAIL && <MailImporterConfig form={form as UseFormReturn<MailProviderConfig>} />}
          </div>
        )}
      </form>
    </Form>
  );

  const handleDeleteSettingsItem = async () => {
    const deleteOptionName = appConfigs.filter((item) => item.name === settingLocation)[0].name;

    navigate(`/${SETTINGS_PATH}`);

    await deleteAppConfigEntry(deleteOptionName);
  };

  const getHeaderDescription = (config: AppConfigDto) => {
    if (config.appType === APP_INTEGRATION_VARIANT.NATIVE) {
      return t(`settings.description.${config.name}`);
    }
    return t(`settings.description.${config.appType}`);
  };

  return (
    <PageLayout
      nativeAppHeader={
        matchingConfig
          ? {
              title: getDisplayName(matchingConfig, language),
              iconSrc: matchingConfig.icon,
              description: getHeaderDescription(matchingConfig),
            }
          : undefined
      }
    >
      {getSettingsForm()}

      <AppConfigFloatingButtons
        handleDeleteSettingsItem={() => setIsDeleteAppConfigDialogOpen(true)}
        handleSaveSettingsItem={handleSubmit(onSubmit)}
      />
      <DeleteAppConfigDialog handleDeleteSettingsItem={handleDeleteSettingsItem} />
    </PageLayout>
  );
};

export default AppConfigPage;
