import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from 'usehooks-ts';

import { Input } from '@/components/ui/input';
import { DropdownMenu } from '@/components';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/shared/Button';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { TrashIcon } from '@/assets/icons';
import { Cross2Icon } from '@radix-ui/react-icons';

const SettingsPage: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const settingLocation =
    location.pathname !== '/settings' ? location.pathname.split('/').filter((part) => part !== '')[1] : '';

  const settingsVisible = settingLocation !== '';

  type ConfigType = {
    [key: string]: { linkPath: string };
  };
  const [config, setConfig] = useLocalStorage<ConfigType>('edu-config', {});

  const [option, setOption] = useState(t(SETTINGS_APPSELECT_OPTIONS[0].name));

  const formSchema = z.object({
    [settingLocation]: z.string().url().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketsystem: '',
      mail: '',
      chat: '',
      conferences: '',
      knowledgebase: '',
      filesharing: '',
      forums: '',
      roombooking: '',
      learningmanagement: '',
      schoolinformation: '',
      schoolmanagement: '',
      printer: '',
      network: '',
      locationservices: '',
      desktopdeployment: '',
      wlan: '',
      mobiledevices: '',
      virtualization: '',
      firewall: '',
      antimalware: '',
      backup: '',
    },
  });

  useEffect(() => {
    if (settingsVisible) {
      form.setValue(settingLocation, config[settingLocation]?.linkPath);
    }
  }, [settingLocation]);

  useEffect(() => {
    if (Object.keys(config).length === 0) {
      navigate('/settings');
    }
  }, [config]);

  const settingsForm = () => {
    const onSubmit = (value: z.infer<typeof formSchema>) => {
      const selectedOption = SETTINGS_APPSELECT_OPTIONS.find((opt) => opt.link.includes(settingLocation));
      if (selectedOption) {
        const appName = selectedOption.name.toLowerCase().split('.')[0];
        // TODO: Save config on server (eg mongoDB)
        setConfig((prevConfig) => ({
          ...prevConfig,
          [appName]: {
            linkPath: value[appName] || '',
          },
        }));
      }
    };
    if (settingsVisible) {
      return (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="column"
          >
            <FormField
              control={form.control}
              name={settingLocation}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.path')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t('form.pathDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="absolute right-20">
              <Button
                type="submit"
                variant="btn-collaboration"
                size="lg"
              >
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      );
    }
    return null;
  };

  const filteredAppOptions = () => {
    const existingOptions = Object.keys(config).map((key) => key);

    return SETTINGS_APPSELECT_OPTIONS.filter((itm) => !existingOptions.includes(itm.name.split('.')[0]));
  };

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h2>{t(settingsVisible ? `${settingLocation}.sidebar` : 'settings.sidebar')}</h2>
          <p className="pb-4">{t('settings.description')}</p>
        </div>

        {settingsVisible ? (
          <Button
            type="button"
            variant="btn-hexagon"
            onClickCapture={() => {
              setConfig((prevConfig) => {
                const { [settingLocation]: omittedValue, ...rest } = prevConfig;
                return rest;
              });
              navigate('/settings');
            }}
          >
            <img
              src={TrashIcon}
              alt="trash"
              width="25px"
            />
          </Button>
        ) : null}
      </div>
      {settingsForm()}
      <Dialog
        modal
        open={mode === 'add'}
      >
        <DialogContent className="data-[state=open]:animate-contentShow fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] text-black shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <DialogHeader>
            <DialogTitle>{t('settings.addApp.title')}</DialogTitle>
            <DialogDescription>{t('settings.addApp.description')}</DialogDescription>
            <DialogClose asChild>
              <button
                type="button"
                className="absolute right-5 top-5 text-black"
                onClick={() => {
                  setSearchParams('');
                }}
              >
                <Cross2Icon />
              </button>
            </DialogClose>
          </DialogHeader>
          <DropdownMenu
            options={filteredAppOptions()}
            selectedVal={t(option)}
            handleChange={(opt) => {
              setOption(opt);
            }}
          />
          <DialogFooter className="justify-center pt-4 text-white">
            <DialogClose asChild>
              <Button
                type="button"
                variant="btn-collaboration"
                size="lg"
                onClick={() => {
                  setSearchParams('');
                  setConfig((prevConfig) => ({
                    [option.toLowerCase().split('.')[0]]: { linkPath: '' },
                    ...prevConfig,
                  }));
                }}
              >
                {t('common.add')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsPage;
