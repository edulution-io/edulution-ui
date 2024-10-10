import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import AddAppConfigDialog from '@/pages/Settings/AppConfig/AddAppConfigDialog';
import { AppConfigOptions, AppConfigOptionsType } from '@libs/appconfig/types';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import { MailProviderConfigDto, TMailEncryption } from '@libs/mail/types';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import APP_CONFIG_OPTION_KEYS from '@libs/appconfig/constants/appConfigOptionKeys';
import useGroupStore from '@/store/GroupStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { SettingsIcon } from '@/assets/icons';
import useIsMobileView from '@/hooks/useIsMobileView';

import { AccordionSH } from '@/components/ui/AccordionSH';
import useMailsStore from '@/pages/Mail/useMailsStore';
import ExtendedOptionsForm from '@/pages/Settings/AppConfig/components/ExtendedOptionsForm';
import YamlEditor from '@/components/shared/YamlEditor';
import Switch from '@/components/ui/Switch';
import AppConfigTypeSelect from './AppConfigTypeSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailsConfig from './mails/MailsConfig';
import formSchema from './appConfigSchema';

const AppConfigPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, setIsDeleteAppConfigDialogOpen, updateAppConfig, deleteAppConfigEntry } = useAppConfigsStore();
  const { searchGroups } = useGroupStore();
  const [option, setOption] = useState('');
  const [settingLocation, setSettingLocation] = useState('');
  const [proxyConfigEnabled, setProxyConfigEnabled] = useState(false);
  const isMobileView = useIsMobileView();
  const { postExternalMailProviderConfig } = useMailsStore();

  useEffect(() => {
    const secondPartFromPath =
      pathname
        .split('/')
        .filter((part) => part !== '')
        .at(1) || '';
    setSettingLocation(pathname !== '/settings' ? secondPartFromPath : '');
  }, [pathname]);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const areSettingsVisible = settingLocation !== '';
  const updateSettings = () => {
    const currentConfig = findAppConfigByName(appConfigs, settingLocation);
    if (!currentConfig || !currentConfig.accessGroups) {
      return;
    }

    const newAccessGroups = currentConfig.accessGroups?.map((item) => ({
      id: item.id,
      name: item.name,
      path: item.path,
      value: item.value,
      label: item.label,
    }));

    setValue(`${settingLocation}.appType`, currentConfig.appType);
    setValue(`${settingLocation}.accessGroups`, newAccessGroups);

    if (currentConfig.options) {
      Object.keys(currentConfig.options).forEach((key) => {
        if (key === APP_CONFIG_OPTION_KEYS.PROXYCONFIG) {
          const proxyConfig = JSON.parse(currentConfig?.options[key] as string) as string;
          setProxyConfigEnabled(proxyConfig !== '');
          setValue(`${settingLocation}.${key}`, proxyConfig);
        } else {
          setValue(`${settingLocation}.${key}`, currentConfig.options[key as AppConfigOptionsType]);
        }
      });
    }

    const possibleExtensions = APP_CONFIG_OPTIONS.find((item) => item.id === settingLocation)?.extendedOptions;
    const newExtendedOptions = possibleExtensions?.map((plugin) => {
      const currentExtension = currentConfig.extendedOptions?.find((item) => item.name === plugin.name);
      return {
        name: plugin.name,
        options: plugin.options?.map((pluginOption) => {
          const currentOption = currentExtension?.options?.find((item) => item.name === pluginOption.name);
          return {
            name: currentOption ? currentOption.name : pluginOption.name,
            value: currentOption ? currentOption.value : pluginOption.value || pluginOption.defaultValue,
            width: currentOption ? currentOption.width : pluginOption.width || 'full',
            type: currentOption ? currentOption.type : pluginOption.type || 'text',
          };
        }),
      };
    });
    setValue(`${settingLocation}.extendedOptions`, newExtendedOptions);
  };

  useEffect(() => {
    if (areSettingsVisible) {
      updateSettings();
    }
  }, [areSettingsVisible, settingLocation, appConfigs]);

  const handleGroupsChange = (newGroups: MultipleSelectorOptionSH[], fieldName: string) => {
    const currentGroups = (getValues(fieldName) as MultipleSelectorOptionSH[]) || [];

    const filteredCurrentGroups = currentGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );
    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];
    setValue(fieldName, combinedGroups, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async () => {
    const selectedOption = APP_CONFIG_OPTIONS.find((item) => item.id.includes(settingLocation));
    if (!selectedOption) {
      return;
    }

    const newConfig = {
      name: settingLocation,
      icon: selectedOption.icon,
      appType: getValues(`${settingLocation}.appType`) as AppIntegrationType,
      options:
        selectedOption.options?.reduce((acc, o) => {
          acc[o] =
            o === APP_CONFIG_OPTION_KEYS.PROXYCONFIG
              ? JSON.stringify(getValues(`${settingLocation}.${o}`) as string)
              : (getValues(`${settingLocation}.${o}`) as string);
          return acc;
        }, {} as AppConfigOptions) || {},
      accessGroups: (getValues(`${settingLocation}.accessGroups`) as MultipleSelectorGroup[]) || [],
      extendedOptions: getValues(`${settingLocation}.extendedOptions`) as AppConfigExtendedOptions[],
    };

    const updatedConfig = appConfigs.map((entry) => {
      if (entry.name === settingLocation) {
        return newConfig;
      }
      return entry;
    });

    await updateAppConfig(updatedConfig);

    if (settingLocation === 'mail' && getValues('configName')) {
      const mailProviderConfig: MailProviderConfigDto = {
        id: (getValues('mailProviderId') || '') as string,
        name: getValues('configName') as string,
        label: getValues('configName') as string,
        host: getValues('hostname') as string,
        port: getValues('port') as string,
        encryption: getValues('encryption') as TMailEncryption,
      };
      void postExternalMailProviderConfig(mailProviderConfig);
    }
  };

  const settingsForm = () => {
    if (areSettingsVisible) {
      return (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="column space-y-6 md:w-[80%]"
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
                      appConfig={appConfigs}
                      isNativeApp={item.isNativeApp}
                    />
                    <FormFieldSH
                      key={`${item.id}.accessGroups`}
                      control={control}
                      name={`${item.id}.accessGroups`}
                      defaultValue=""
                      render={() => (
                        <FormItem>
                          <h4>{t(`permission.groups`)}</h4>
                          <FormControl>
                            <AsyncMultiSelect<MultipleSelectorGroup>
                              value={getValues(`${item.id}.accessGroups`) as MultipleSelectorGroup[]}
                              onSearch={searchGroups}
                              onChange={(groups) => handleGroupsChange(groups, `${item.id}.accessGroups`)}
                              placeholder={t('search.type-to-search')}
                            />
                          </FormControl>
                          <p>{t(`permission.selectGroupsDescription`)}</p>
                          <FormMessage className="text-p" />
                        </FormItem>
                      )}
                    />
                    {item.options?.map((itemOption) => (
                      <FormFieldSH
                        key={`${item.id}.${itemOption}`}
                        control={control}
                        name={`${item.id}.${itemOption}`}
                        defaultValue=""
                        render={({ field }) => (
                          <FormItem>
                            <h4>{t(`form.${itemOption}`)}</h4>
                            <FormControl>
                              {itemOption !== 'proxyConfig' ? (
                                <Input
                                  {...field}
                                  variant="lightGray"
                                />
                              ) : (
                                <>
                                  <Switch
                                    checked={proxyConfigEnabled}
                                    onCheckedChange={setProxyConfigEnabled}
                                  />
                                  {proxyConfigEnabled ? (
                                    <YamlEditor
                                      value={field.value as string}
                                      onChange={field.onChange}
                                    />
                                  ) : null}
                                </>
                              )}
                            </FormControl>
                            <p>{t(`form.${itemOption}Description`)}</p>
                            <FormMessage className="text-p" />
                          </FormItem>
                        )}
                      />
                    ))}
                    {item.extendedOptions && (
                      <div className="space-y-10">
                        <AccordionSH type="multiple">
                          <ExtendedOptionsForm
                            form={form}
                            settingLocation={settingLocation}
                            extendedOptions={
                              form.watch(`${settingLocation}.extendedOptions`) as AppConfigExtendedOptions[]
                            }
                            onExtendedOptionsChange={(extensionValues: AppConfigExtendedOptions[]) =>
                              form.setValue(`${item.id}.extendedOptions`, extensionValues)
                            }
                          />
                        </AccordionSH>
                      </div>
                    )}
                    <div>{settingLocation === 'mail' && <MailsConfig form={form} />}</div>
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

    setSettingLocation('');
    navigate(`/settings`);

    await deleteAppConfigEntry(deleteOptionName);
  };

  return (
    <>
      <div className="h-[calc(100vh-var(--floating-buttons-height))] overflow-y-auto scrollbar-thin">
        <NativeAppHeader
          title={t(areSettingsVisible ? `${settingLocation}.sidebar` : 'settings.sidebar')}
          description={!isMobileView ? t('settings.description') : null}
          iconSrc={APP_CONFIG_OPTIONS.find((item) => item.id === settingLocation)?.icon || SettingsIcon}
        />
        {settingsForm()}
      </div>
      {areSettingsVisible ? (
        <AppConfigFloatingButtons
          handleDeleteSettingsItem={() => setIsDeleteAppConfigDialogOpen(true)}
          handleSaveSettingsItem={handleSubmit(onSubmit)}
        />
      ) : null}
      <AddAppConfigDialog
        option={option}
        setOption={setOption}
        filteredAppOptions={filteredAppOptions}
      />
      <DeleteAppConfigDialog handleDeleteSettingsItem={handleDeleteSettingsItem} />
    </>
  );
};

export default AppConfigPage;
