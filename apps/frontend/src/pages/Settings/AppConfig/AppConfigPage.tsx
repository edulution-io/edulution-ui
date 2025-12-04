/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
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
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
import getDisplayName from '@/utils/getDisplayName';
import PageLayout from '@/components/structure/layout/PageLayout';
import AppConfigPositionSelect from '@/pages/Settings/AppConfig/components/dropdown/AppConfigPositionSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailImporterConfig from './mails/MailImporterConfig';
import getAppConfigFormSchema from './schemas/getAppConfigFormSchema';
import ProxyConfigForm from './components/ProxyConfigForm';
import DeleteWebdavServerWarningDialog from './filesharing/DeleteWebdavServerWarningDialog';

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

  const extendedOptionsToRender = APP_CONFIG_OPTIONS.find((appConfigOption) => {
    if (matchingConfig?.appType === APP_INTEGRATION_VARIANT.NATIVE) return appConfigOption.id === settingLocation;
    return appConfigOption.id === matchingConfig?.appType;
  })?.extendedOptions;

  const getSettingsForm = () => (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="column max-w-screen-2xl space-y-6"
      >
        {matchingConfig && (
          <div className="m-5 space-y-10 [&>*]:rounded-xl [&>*]:bg-muted-background [&>*]:px-2">
            <div className="space-y-3 py-3">
              <AppConfigPositionSelect
                form={form}
                appConfig={matchingConfig}
              />
              <FormFieldSH
                key={`${matchingConfig.name}.accessGroups`}
                control={control}
                name={`${matchingConfig.name}.accessGroups`}
                render={() => (
                  <FormItem>
                    <h3 className="text-background">{t(`permission.groups`)}</h3>
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
            </div>
            {Object.keys(matchingConfig.options)
              .filter((key) => key === APP_CONFIG_OPTION_KEYS.URL || key === APP_CONFIG_OPTION_KEYS.APIKEY)
              .map((filteredKey) => (
                <FormFieldSH
                  key={`${matchingConfig.name}.options.${filteredKey}`}
                  control={control}
                  name={`${matchingConfig.name}.options.${filteredKey}`}
                  defaultValue={filteredKey}
                  render={({ field }) => (
                    <FormItem className="py-3">
                      <h3 className="text-background">{t(`form.${filteredKey}`)}</h3>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
              ))}
            {matchingConfig.extendedOptions ? (
              <ExtendedOptionsForm
                extendedOptions={extendedOptionsToRender}
                control={control}
                settingLocation={settingLocation}
                form={form}
              />
            ) : null}
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
      <DeleteAppConfigDialog
        appName={settingLocation}
        appDisplayName={matchingConfig ? getDisplayName(matchingConfig, language) : settingLocation}
        handleDeleteSettingsItem={handleDeleteSettingsItem}
      />
      {matchingConfig?.name === APPS.FILE_SHARING && <DeleteWebdavServerWarningDialog />}
    </PageLayout>
  );
};

export default AppConfigPage;
