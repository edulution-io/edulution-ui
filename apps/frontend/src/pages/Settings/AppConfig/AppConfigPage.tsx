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

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import AddAppConfigDialog from '@/pages/Settings/AppConfig/AddAppConfigDialog';
import { AppConfigOptions, AppConfigOptionsType } from '@libs/appconfig/types';
import useGroupStore from '@/store/GroupStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { SettingsIcon } from '@/assets/icons';
import useIsMobileView from '@/hooks/useIsMobileView';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { MailProviderConfigDto } from '@libs/mail/types';
import APP_CONFIG_OPTION_KEYS from '@libs/appconfig/constants/appConfigOptionKeys';
import ExtendedOptionsForm from '@/pages/Settings/AppConfig/components/ExtendedOptionsForm';
import { AppConfigDto } from '@libs/appconfig/types/appConfigDto';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import type TApps from '@libs/appconfig/types/appsType';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import APPS from '@libs/appconfig/constants/apps';
import AppConfigTypeSelect from './AppConfigTypeSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailImporterConfig from './mails/MailImporterConfig';
import appConfigFormSchema from './appConfigSchema';
import ProxyConfigForm from './components/ProxyConfigForm';
import DockerContainerTable from './DockerIntegration/DockerContainerTable';

const AppConfigPage: React.FC = () => {
  const { settingLocation = '' } = useParams<{ settingLocation: TApps }>();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, getAppConfigs, setIsDeleteAppConfigDialogOpen, updateAppConfig, deleteAppConfigEntry } =
    useAppConfigsStore();
  const { searchGroups } = useGroupStore();
  const [option, setOption] = useState('');
  const isMobileView = useIsMobileView();
  const { postExternalMailProviderConfig } = useMailsStore();

  const form = useForm<{ [settingLocation: string]: AppConfigDto | string } | ProxyConfigFormType | MailProviderConfig>(
    {
      mode: 'onChange',
      resolver: zodResolver(appConfigFormSchema),
    },
  );

  useEffect(() => {
    void getAppConfigs();
  }, []);

  const { control, handleSubmit, setValue, getValues, clearErrors } = form;

  const isAnAppConfigSelected = settingLocation !== '';

  const updateSettings = () => {
    const currentConfig = findAppConfigByName(appConfigs, settingLocation);
    if (!currentConfig) {
      return;
    }

    clearErrors();

    setValue(`${settingLocation}.appType`, currentConfig.appType);
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
    if (isAnAppConfigSelected) {
      updateSettings();
    }
  }, [isAnAppConfigSelected, settingLocation, appConfigs]);

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
    const selectedOption = APP_CONFIG_OPTIONS.find((item) => item.id.includes(settingLocation));
    if (!selectedOption) {
      return;
    }

    const options =
      selectedOption.options?.reduce((acc, o) => {
        acc[o] =
          o === APP_CONFIG_OPTION_KEYS.PROXYCONFIG
            ? JSON.stringify(getValues(`${settingLocation}.${o}`))
            : getValues(`${settingLocation}.options.${o}`);
        return acc;
      }, {} as AppConfigOptions) || {};

    const extendedOptions = form.getValues(`${settingLocation}.extendedOptions`) || {};

    const newConfig: AppConfigDto = {
      name: settingLocation,
      icon: selectedOption.icon,
      appType: getValues(`${settingLocation}.appType`),
      options,
      extendedOptions,
      accessGroups: getValues(`${settingLocation}.accessGroups`) || [],
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

  const settingsForm = () => {
    if (isAnAppConfigSelected) {
      return (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="column max-w-screen-2xl space-y-6"
          >
            {APP_CONFIG_OPTIONS.map((item) => (
              <div
                key={item.id}
                className="m-5"
              >
                {settingLocation === item.id ? (
                  <div className="space-y-10">
                    <AppConfigTypeSelect
                      control={control}
                      settingLocation={settingLocation}
                      isNativeApp={item.isNativeApp}
                      defaultValue={form.watch(`${item.id}.appType`)}
                    />
                    <FormFieldSH
                      key={`${item.id}.accessGroups`}
                      control={control}
                      name={`${item.id}.accessGroups`}
                      render={() => (
                        <FormItem>
                          <h4 className="text-background">{t(`permission.groups`)}</h4>
                          <FormControl>
                            <AsyncMultiSelect<MultipleSelectorGroup>
                              value={getValues(`${item.id}.accessGroups`)}
                              onSearch={searchGroups}
                              onChange={(groups) => handleGroupsChange(groups, `${item.id}`)}
                              placeholder={t('search.type-to-search')}
                            />
                          </FormControl>
                          <p className="text-background">{t(`permission.selectGroupsDescription`)}</p>
                          <FormMessage className="text-p" />
                        </FormItem>
                      )}
                    />
                    <ExtendedOptionsForm
                      extendedOptions={item.extendedOptions}
                      control={control}
                      settingLocation={settingLocation}
                    />
                    {item.options?.map((itemOption) =>
                      itemOption !== 'proxyConfig' ? (
                        <FormFieldSH
                          key={`${item.id}.options.${itemOption}`}
                          control={control}
                          name={`${item.id}.options.${itemOption}`}
                          defaultValue=""
                          render={({ field }) => (
                            <FormItem>
                              <h4 className="text-background">{t(`form.${itemOption}`)}</h4>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage className="text-p" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <ProxyConfigForm
                          key={`${item.id}.options.${itemOption}`}
                          item={item}
                          form={form as UseFormReturn<ProxyConfigFormType>}
                        />
                      ),
                    )}
                    {settingLocation === APPS.MAIL && (
                      <MailImporterConfig form={form as UseFormReturn<MailProviderConfig>} />
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </form>
        </Form>
      );
    }
    return null;
  };

  const filteredAppOptions = () => {
    const existingOptions = appConfigs.map((item) => item.name);
    const filteredOptions = APP_CONFIG_OPTIONS.filter((item) => !existingOptions.includes(item.id));

    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
  };

  const handleDeleteSettingsItem = async () => {
    const deleteOptionName = appConfigs.filter((item) => item.name === settingLocation)[0].name;

    navigate(`/${SETTINGS_PATH}`);

    await deleteAppConfigEntry(deleteOptionName);
  };

  return (
    <>
      <div className="h-[calc(100vh-var(--floating-buttons-height))] overflow-y-auto scrollbar-thin">
        <NativeAppHeader
          title={t(isAnAppConfigSelected ? `${settingLocation}.sidebar` : 'settings.sidebar')}
          description={!isMobileView && settingLocation ? t(`settings.description.${settingLocation}`) : null}
          iconSrc={APP_CONFIG_OPTIONS.find((item) => item.id === settingLocation)?.icon || SettingsIcon}
        />
        {isAnAppConfigSelected ? settingsForm() : <DockerContainerTable />}
      </div>
      {isAnAppConfigSelected ? (
        <AppConfigFloatingButtons
          handleDeleteSettingsItem={() => setIsDeleteAppConfigDialogOpen(true)}
          handleSaveSettingsItem={handleSubmit(onSubmit)}
        />
      ) : null}
      <AddAppConfigDialog
        option={option}
        setOption={setOption}
        getFilteredAppOptions={filteredAppOptions}
      />
      <DeleteAppConfigDialog handleDeleteSettingsItem={handleDeleteSettingsItem} />
    </>
  );
};

export default AppConfigPage;
