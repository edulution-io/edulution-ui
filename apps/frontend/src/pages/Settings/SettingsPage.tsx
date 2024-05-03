import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMediaQuery } from 'usehooks-ts';
import { toast } from 'sonner';

import Input from '@/components/shared/Input';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { TrashIcon } from '@/assets/icons';
import Toaster from '@/components/ui/Sonner';
import { AppIntegrationType } from '@/datatypes/types';
import MobileSettingsDialog from '@/pages/Settings/SettingsDialog/MobileSettingsDialog';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import DesktopSettingsDialog from '@/pages/Settings/SettingsDialog/DesktopSettingsDialog';
import useAppDataStore from '@/store/appDataStore';
import { findEntryByName } from '@/utils/common';
import useAppConfigQuery from '@/api/useAppConfigQuery';

const SettingsPage: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { updateSettingsConfig, deleteSettingsConfigEntry } = useAppConfigQuery();
  const { config, setConfig } = useAppDataStore();
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
      setValue(`${settingLocation}.path`, findEntryByName(config, settingLocation)?.linkPath);
      setValue(`${settingLocation}.appType`, findEntryByName(config, settingLocation)?.appType);
    }
  }, [areSettingsVisible, settingLocation, config]);

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

        const updatedConfig = config.map((entry) => {
          if (entry.name === settingLocation) {
            return newConfig;
          }
          return entry;
        });

        setConfig(updatedConfig);

        updateSettingsConfig(updatedConfig)
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
                    <FormFieldSH
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
                      <FormFieldSH
                        control={control}
                        name={`${item.id}.appType`}
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <h4>{t('form.apptype')}</h4>
                            <FormControl>
                              <RadioGroupSH
                                onValueChange={field.onChange}
                                defaultValue={findEntryByName(config, settingLocation)?.appType}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItemSH value={AppIntegrationType.NATIVE} />
                                  </FormControl>
                                  <p>{t('form.native')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItemSH value={AppIntegrationType.FORWARDED} />
                                  </FormControl>
                                  <p>{t('form.forwarded')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItemSH value={AppIntegrationType.EMBEDDED} />
                                  </FormControl>
                                  <p>{t('form.embedded')}</p>
                                </FormItem>
                              </RadioGroupSH>
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
    const existingOptions = config.map((item) => item.name);
    const filteredOptions = SETTINGS_APPSELECT_OPTIONS.filter((item) => !existingOptions.includes(item.id));

    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
  };

  const handleDeleteSettingsItem = () => {
    const deleteOptionName = config.filter((item) => item.name === settingLocation)[0].name;
    deleteSettingsConfigEntry(deleteOptionName)
      .then(() => {
        const filteredArray = config.filter((item) => item.name !== settingLocation);
        setConfig(filteredArray);
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
      {isMobile ? <MobileSettingsDialog {...dialogProps} /> : <DesktopSettingsDialog {...dialogProps} />}
      <Toaster />
    </>
  );
};

export default SettingsPage;
