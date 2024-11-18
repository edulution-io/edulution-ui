import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import { MailProviderConfigDto, TMailEncryption } from '@libs/mail/types';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import { AppConfigDto, AppConfigSection, AppIntegrationType } from '@libs/appconfig/types';
import useIsMobileView from '@/hooks/useIsMobileView';
import { findAppConfigByName } from '@/utils/common';
import { SettingsIcon } from '@/assets/icons';
import useGroupStore from '@/store/GroupStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import AddAppConfigDialog from '@/pages/Settings/AppConfig/AddAppConfigDialog';
import useMailsStore from '@/pages/Mail/useMailsStore';
import AppConfigOptionsForm from '@/pages/Settings/AppConfig/components/AppConfigOptionsForm';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { AccordionSH } from '@/components/ui/AccordionSH';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import AppConfigTypeSelect from './AppConfigTypeSelect';
import AppConfigFloatingButtons from './AppConfigFloatingButtonsBar';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';
import MailsConfig from './mails/MailsConfig';
import formSchema from './appConfigSchema';

const AppConfigPage = () => {
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

    const defaultAppConfigOptions = APP_CONFIG_OPTIONS.find((config) => config.name === settingLocation)?.options;
    defaultAppConfigOptions?.map((currentSection) => {
      const existingSection = currentConfig.options?.find(
        (section) => section.sectionName === currentSection.sectionName,
      );
      return {
        sectionName: currentSection.sectionName,
        options: currentSection.options?.map((currentField) => {
          if (currentField.name === APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG) {
            const proxyConfig = JSON.parse(currentField.value as string) as string;
            const updatedField = {
              type: currentField.type || TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG,
              name: currentField.name || APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
              value: proxyConfig,
              width: currentField.width || 'full',
            };
            setValue(`${settingLocation}.options.${currentSection.sectionName}.${currentField.name}`, updatedField);
            return updatedField;
          }

          const currentOption = existingSection?.options?.find((field) => field.name === currentField.name);
          const updatedField = {
            type: currentOption?.type || currentField.type || 'text',
            name: currentOption?.name || currentField.name,
            value: currentOption?.value || currentField.value,
            width: currentOption?.width || currentField.width || 'full',
          };
          setValue(`${settingLocation}.options.${currentSection.sectionName}.${currentField.name}`, updatedField);
          return updatedField;
        }),
      };
    });
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
    const selectedOption = APP_CONFIG_OPTIONS.find((item) => item.name.includes(settingLocation));
    if (!selectedOption) {
      return;
    }

    const newConfig: AppConfigDto = {
      name: settingLocation,
      icon: selectedOption.icon,
      appType: getValues(`${settingLocation}.appType`) as AppIntegrationType,
      options: (selectedOption.options || []).map((section) => ({
        sectionName: section.sectionName,
        options: section.options?.map((field) => ({
          name: field.name,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: getValues(`${settingLocation}.${field.name}`),
          type: field.type,
          width: field.width,
        })),
      })),
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
                key={item.name}
                className="m-5"
              >
                {settingLocation === item.name ? (
                  <div className="space-y-10">
                    <AppConfigTypeSelect
                      control={control}
                      settingLocation={settingLocation}
                      appConfig={appConfigs}
                      isNativeApp={item.appType === APP_INTEGRATION_VARIANT.NATIVE}
                    />
                    <FormFieldSH
                      key={`${item.name}.accessGroups`}
                      control={control}
                      name={`${item.name}.accessGroups`}
                      defaultValue=""
                      render={() => (
                        <FormItem>
                          <h4>{t(`permission.groups`)}</h4>
                          <FormControl>
                            <AsyncMultiSelect<MultipleSelectorGroup>
                              value={getValues(`${item.name}.accessGroups`) as MultipleSelectorGroup[]}
                              onSearch={searchGroups}
                              onChange={(groups) => handleGroupsChange(groups, `${item.name}.accessGroups`)}
                              placeholder={t('search.type-to-search')}
                            />
                          </FormControl>
                          <p>{t(`permission.selectGroupsDescription`)}</p>
                          <FormMessage className="text-p" />
                        </FormItem>
                      )}
                    />
                    {item.options && (
                      <div className="space-y-10">
                        <AccordionSH type="multiple">
                          <AppConfigOptionsForm
                            form={form}
                            settingLocation={settingLocation}
                            sections={form.watch(`${settingLocation}.options`) as AppConfigSection[]}
                            onChange={(extensionValues: AppConfigSection[]) =>
                              form.setValue(`${item.name}.options`, extensionValues)
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
    const filteredOptions = APP_CONFIG_OPTIONS.filter((item) => !existingOptions.includes(item.name));

    return filteredOptions.map((item) => ({ id: item.name, name: `${item.name}.sidebar` }));
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
          iconSrc={APP_CONFIG_OPTIONS.find((item) => item.name === settingLocation)?.icon || SettingsIcon}
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
