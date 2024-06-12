import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import { TrashIcon } from '@/assets/icons';
import Toaster from '@/components/ui/Sonner';
import { AppIntegrationType } from '@/datatypes/types';
import useAppConfigsStoreOLD from '@/store/appConfigsStoreOLD';
import { findAppConfigByName } from '@/utils/common';
import useIsMobileView from '@/hooks/useIsMobileView';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import MobileSettingsDialog from '@/pages/Settings/AppConfig/AppConfigDialog/MobileAppConfigDialog';
import DesktopSettingsDialog from '@/pages/Settings/AppConfig/AppConfigDialog/DesktopAppConfigDialog';
import { SettingsDialogProps } from '@/pages/Settings/AppConfig/AppConfigDialog/settingTypes';
import { AppConfigOptions, AppConfigOptionType } from '@/datatypes/appConfigOptions';
import AppConfigTypeSelect from './AppConfigTypeSelect';

const AppConfigPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isMobileView = useIsMobileView();
  const { appConfig, updateAppConfig, deleteAppConfigEntry } = useAppConfigsStoreOLD();
  const [option, setOption] = useState('');

  const settingLocation = pathname !== '/settings' ? pathname.split('/').filter((part) => part !== '')[1] : '';

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
    const currentConfig = findAppConfigByName(appConfig, settingLocation);
    if (!currentConfig) {
      return;
    }

    setValue(`${settingLocation}.appType`, currentConfig.appType);
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
  }, [areSettingsVisible, settingLocation, appConfig, setValue]);

  const settingsForm = () => {
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = () => {
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
        };

        const updatedConfig = appConfig.map((entry) => {
          if (entry.name === settingLocation) {
            return newConfig;
          }
          return entry;
        });

        updateAppConfig(updatedConfig)
          .then(() => toast.success(`${t(`${settingLocation}.sidebar`)} - ${t('settings.appconfig.update.success')}`))
          .catch(() => toast.error(`${t(`${settingLocation}.sidebar`)} - ${t('settings.appconfig.update.failed')}`));
      }
    };

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
                  <>
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
                    <div className="pt-10">
                      <AppConfigTypeSelect
                        control={control}
                        settingLocation={settingLocation}
                        appConfig={appConfig}
                      />
                    </div>
                    <div className="absolute right-20 sm:pr-10 md:right-20">
                      <Button
                        type="submit"
                        variant="btn-collaboration"
                        className="justify-end pr-5"
                        size="lg"
                      >
                        {t('common.save')}
                      </Button>
                    </div>
                  </>
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
    const existingOptions = appConfig.map((item) => item.name);
    const filteredOptions = APP_CONFIG_OPTIONS.filter((item) => !existingOptions.includes(item.id));

    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
  };

  const handleDeleteSettingsItem = () => {
    const deleteOptionName = appConfig.filter((item) => item.name === settingLocation)[0].name;
    deleteAppConfigEntry(deleteOptionName)
      .then(() => {
        toast.success(`${t(`${deleteOptionName}.sidebar`)} - ${t('settings.appconfig.delete.success')}`, {
          description: new Date().toLocaleString(),
        });
      })
      .catch(() =>
        toast.error(`${t(`${deleteOptionName}.sidebar`)} - ${t('settings.appconfig.delete.failed')}`, {
          description: new Date().toLocaleString(),
        }),
      );
  };

  const dialogProps: SettingsDialogProps = {
    isOpen: mode === 'add',
    option,
    setOption,
    filteredAppOptions,
    setSearchParams,
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="pt-5 sm:pt-0">
          <h2>{t(areSettingsVisible ? `${settingLocation}.sidebar` : 'settings.sidebar')}</h2>
          <p className="pb-4">{t('settings.description')}</p>
        </div>

        {areSettingsVisible ? (
          <Button
            type="button"
            variant="btn-hexagon"
            className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
            onClickCapture={handleDeleteSettingsItem}
          >
            <img
              className="m-6"
              src={TrashIcon}
              alt="trash"
              width="25px"
            />
          </Button>
        ) : null}
      </div>
      {settingsForm()}
      {isMobileView ? <MobileSettingsDialog {...dialogProps} /> : <DesktopSettingsDialog {...dialogProps} />}
      <Toaster />
    </>
  );
};

export default AppConfigPage;
