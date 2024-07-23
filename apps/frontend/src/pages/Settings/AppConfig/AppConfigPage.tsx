import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { findAppConfigByName } from '@/utils/common';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import AddAppConfigDialog from '@/pages/Settings/AppConfig/AddAppConfigDialog';
import { AppConfigOptions, AppConfigOptionType, AppIntegrationType } from '@libs/appconfig/types';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import useGroupStore from '@/store/GroupStore';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdOutlineDeleteOutline, MdOutlineSave } from 'react-icons/md';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { SettingsIcon } from '@/assets/icons';
import AppConfigTypeSelect from './AppConfigTypeSelect';

const AppConfigPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { appConfigs, updateAppConfig, deleteAppConfigEntry, error } = useAppConfigsStore();
  const { searchGroups } = useGroupStore();
  const [option, setOption] = useState('');
  const [settingLocation, setSettingLocation] = useState('');

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

    const newAccessGroups: MultipleSelectorOptionSH[] = currentConfig.accessGroups?.map((item) => ({
      value: item,
      label: item,
    }));

    setValue(`${settingLocation}.appType`, currentConfig.appType);
    setValue(`${settingLocation}.accessGroups`, newAccessGroups || []);
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
    const currentGroups = (getValues(`${fieldName}`) as MultipleSelectorOptionSH[]) || [];

    const filteredCurrentGroups = currentGroups.filter((currentGroup) =>
      newGroups.some((newGroup) => newGroup.value === currentGroup.value),
    );

    const combinedGroups = [
      ...filteredCurrentGroups,
      ...newGroups.filter(
        (newGroup) => !filteredCurrentGroups.some((currentGroup) => currentGroup.value === newGroup.value),
      ),
    ];

    setValue(`${fieldName}`, combinedGroups, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async () => {
    const selectedOption = APP_CONFIG_OPTIONS.find((item) => item.id.includes(settingLocation));
    if (selectedOption) {
      const newConfig = {
        name: settingLocation,
        icon: selectedOption.icon,
        appType: getValues(`${settingLocation}.appType`) as AppIntegrationType,
        options:
          selectedOption.options?.reduce((acc, o) => {
            acc[o] = getValues(`${settingLocation}.${o}`) as AppConfigOptionType;
            return acc;
          }, {} as AppConfigOptions) || {},
        accessGroups:
          ((getValues(`${settingLocation}.accessGroups`) as MultipleSelectorOptionSH[]).map(
            (item) => item.path,
          ) as string[]) || [],
      };

      const updatedConfig = appConfigs.map((entry) => {
        if (entry.name === settingLocation) {
          return newConfig;
        }
        return entry;
      });

      await updateAppConfig(updatedConfig);
      if (!error) {
        toast.success(`${t(`${settingLocation}.sidebar`)} - ${t('settings.appconfig.update.success')}`);
      }
    }
  };

  const settingsForm = () => {
    if (areSettingsVisible) {
      return (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="column w-2/3 space-y-6"
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

    await deleteAppConfigEntry(deleteOptionName).then(() => {
      toast.success(`${t(`${deleteOptionName}.sidebar`)} - ${t('settings.appconfig.delete.success')}`, {
        description: new Date().toLocaleString(),
      });
    });
  };

  return (
    <>
      <div className="h-[calc(100vh-var(--floating-buttons-height))] overflow-hidden">
        <NativeAppHeader
          title={t(areSettingsVisible ? `${settingLocation}.sidebar` : 'settings.sidebar')}
          description={t('settings.description')}
          iconSrc={APP_CONFIG_OPTIONS.find((item) => item.id === settingLocation)?.icon || SettingsIcon}
        />
        {settingsForm()}
      </div>
      {areSettingsVisible ? (
        <div className="fixed bottom-8 flex flex-row bg-opacity-90">
          <FloatingActionButton
            type="button"
            icon={MdOutlineSave}
            text={t('common.save')}
            onClick={handleSubmit(onSubmit)}
          />
          <FloatingActionButton
            icon={MdOutlineDeleteOutline}
            text={t('settings.delete')}
            onClick={handleDeleteSettingsItem}
          />
        </div>
      ) : null}
      <AddAppConfigDialog
        isOpen={mode === 'add'}
        option={option}
        setOption={setOption}
        filteredAppOptions={filteredAppOptions}
        setSearchParams={setSearchParams}
      />
    </>
  );
};

export default AppConfigPage;
