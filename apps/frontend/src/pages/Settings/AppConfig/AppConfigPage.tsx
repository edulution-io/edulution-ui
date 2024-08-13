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
import { AppConfigOptions, AppConfigOptionType, AppIntegrationType } from '@libs/appconfig/types';
import useGroupStore from '@/store/GroupStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { SettingsIcon } from '@/assets/icons';
import useIsMobileView from '@/hooks/useIsMobileView';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useMailsStore from '@/pages/Mail/useMailsStore';
import MailProviderConfigDto from '@libs/mail/types/mailProviderConfig.dto';
import AppConfigTypeSelect from './AppConfigTypeSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailsConfig from './mails/MailsConfig';

const AppConfigPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, setIsDeleteAppConfigDialogOpen, updateAppConfig, deleteAppConfigEntry } = useAppConfigsStore();
  const { searchGroups } = useGroupStore();
  const [option, setOption] = useState('');
  const [settingLocation, setSettingLocation] = useState('');
  const isMobileView = useIsMobileView();
  const { postExternalMailProviderConfig } = useMailsStore();

  useEffect(() => {
    setSettingLocation(pathname !== '/settings' ? pathname.split('/').filter((part) => part !== '')[1] : '');
  }, [pathname]);

  const formSchemaObject: { [key: string]: z.Schema } = {};

  APP_CONFIG_OPTIONS.forEach((item) => {
    formSchemaObject[`${item.id}.appType`] = z.nativeEnum(AppIntegrationType).optional();
    if (item.options) {
      item.options.forEach((itemOption) => {
        formSchemaObject[`${item.id}.${itemOption}`] = z.string().optional();
      });
    }
  });

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const areSettingsVisible = settingLocation !== '';

  const updateSettings = () => {
    const currentConfig = findAppConfigByName(appConfigs, settingLocation);
    if (!currentConfig) {
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
        setValue(`${settingLocation}.${key}`, currentConfig.options[key as AppConfigOptionType]);
      });
    }
  };

  useEffect(() => {
    if (areSettingsVisible) {
      updateSettings();
    }
  }, [areSettingsVisible, settingLocation, appConfigs, setValue]);

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
          acc[o] = getValues(`${settingLocation}.${o}`) as AppConfigOptionType;
          return acc;
        }, {} as AppConfigOptions) || {},
      accessGroups: (getValues(`${settingLocation}.accessGroups`) as MultipleSelectorGroup[]) || [],
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
        port: getValues('port') as number,
        secure: true,
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
            className="column space-y-6 md:w-2/3"
          >
            {APP_CONFIG_OPTIONS.map((item) => (
              <div
                key={item.id}
                className="m-5"
              >
                {settingLocation === item.id ? (
                  <div className="space-y-10">
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
                              <Input {...field} />
                            </FormControl>
                            <p>{t(`form.${itemOption}Description`)}</p>
                            <FormMessage className="text-p" />
                          </FormItem>
                        )}
                      />
                    ))}

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
      <div className="overflow-y-auto">
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
