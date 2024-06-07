import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMediaQuery } from 'usehooks-ts';
import { toast } from 'sonner';

import Input from '@/components/shared/Input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { TrashIcon } from '@/assets/icons';
import Toaster from '@/components/ui/Sonner';
import { AppIntegrationType } from '@/datatypes/types';
import MobileSettingsDialog from '@/pages/Settings/SettingsDialog/MobileSettingsDialog';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import DesktopSettingsDialog from '@/pages/Settings/SettingsDialog/DesktopSettingsDialog';
import useAppConfigsStoreOLD from '@/store/appConfigsStoreOLD';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigQuery from '@/api/useAppConfigQuery';

const SettingsPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { updateAppConfig, deleteAppConfigEntry } = useAppConfigQuery();
  const { appConfig, setAppConfig } = useAppConfigsStoreOLD();
  const [option, setOption] = useState('');

  const settingLocation = pathname !== '/settings' ? pathname.split('/').filter((part) => part !== '')[1] : '';

  const formSchemaObject: { [key: string]: z.Schema } = {};

  SETTINGS_APPSELECT_OPTIONS.forEach((item) => {
    formSchemaObject[`${item.id}.path`] = z.string().optional();
    formSchemaObject[`${item.id}.appType`] = z.nativeEnum(AppIntegrationType).optional();
  });

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const areSettingsVisible = settingLocation !== '';

  useEffect(() => {
    if (areSettingsVisible) {
      setValue(`${settingLocation}.path`, findAppConfigByName(appConfig, settingLocation)?.linkPath);
      setValue(`${settingLocation}.appType`, findAppConfigByName(appConfig, settingLocation)?.appType);
    }
  }, [areSettingsVisible, settingLocation, appConfig]);

  const settingsForm = () => {
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = () => {
      const selectedOption = SETTINGS_APPSELECT_OPTIONS.find((item) => item.id.includes(settingLocation));

      if (selectedOption) {
        const newConfig = {
          name: settingLocation,
          linkPath: getValues(`${settingLocation}.path`) as string,
          icon: selectedOption.icon,
          appType: getValues(`${settingLocation}.appType`) as AppIntegrationType,
        };

        const updatedConfig = appConfig.map((entry) => {
          if (entry.name === settingLocation) {
            return newConfig;
          }
          return entry;
        });

        setAppConfig(updatedConfig);

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
            {SETTINGS_APPSELECT_OPTIONS.map((item) => (
              <div
                key={item.id}
                className="m-5"
              >
                {settingLocation === item.id ? (
                  <>
                    <FormField
                      control={control}
                      name={`${item.id}.path`}
                      defaultValue=""
                      render={({ field }) => (
                        <FormItem>
                          <h4>{t('form.path')}</h4>
                          <FormControl>
                            <Input
                              {...field}
                              className="text-white"
                            />
                          </FormControl>
                          <p>{t('form.pathDescription')}</p>
                          <FormMessage className="text-p" />
                        </FormItem>
                      )}
                    />
                    <div className="pt-10">
                      <FormField
                        control={control}
                        name={`${item.id}.appType`}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <h4>{t('form.apptype')}</h4>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={findAppConfigByName(appConfig, settingLocation)?.appType}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={AppIntegrationType.NATIVE} />
                                  </FormControl>
                                  <p>{t('form.native')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={AppIntegrationType.FORWARDED} />
                                  </FormControl>
                                  <p>{t('form.forwarded')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={AppIntegrationType.EMBEDDED} />
                                  </FormControl>
                                  <p>{t('form.embedded')}</p>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
    const filteredOptions = SETTINGS_APPSELECT_OPTIONS.filter((item) => !existingOptions.includes(item.id));

    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
  };

  const handleDeleteSettingsItem = () => {
    const deleteOptionName = appConfig.filter((item) => item.name === settingLocation)[0].name;
    deleteAppConfigEntry(deleteOptionName)
      .then(() => {
        const filteredArray = appConfig.filter((item) => item.name !== settingLocation);
        setAppConfig(filteredArray);
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

  const handleAddApp = () => {
    setSearchParams('');
    const selectedOption = option.toLowerCase().split('.')[0];
    const optionsConfig = SETTINGS_APPSELECT_OPTIONS.find((item) => item.id.includes(selectedOption));

    if (optionsConfig) {
      const newConfig = {
        name: selectedOption,
        linkPath: '',
        icon: optionsConfig.icon,
        appType: AppIntegrationType.FORWARDED,
      };
      const updatedConfig = [...appConfig, newConfig];

      setAppConfig(updatedConfig);
      updateAppConfig(updatedConfig)
        .then(() => toast.success(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.success')}`))
        .catch(() => toast.error(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.failed')}`));
    }
  };

  const dialogProps: SettingsDialogProps = {
    isOpen: mode === 'add',
    option,
    setOption,
    filteredAppOptions,
    setSearchParams,
    handleAddApp,
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
      {isMobile ? <MobileSettingsDialog {...dialogProps} /> : <DesktopSettingsDialog {...dialogProps} />}
      <Toaster />
    </>
  );
};

export default SettingsPage;
