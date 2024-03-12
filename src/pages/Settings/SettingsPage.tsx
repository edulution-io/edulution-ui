import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from 'usehooks-ts';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { DropdownMenu } from '@/components';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/shared/Button';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TrashIcon } from '@/assets/icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import Toaster from '@/components/ui/sonner';
import { ConfigType } from '@/datatypes/types';

const SettingsPage: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const navigate = useNavigate();

  const settingLocation =
    location.pathname !== '/settings' ? location.pathname.split('/').filter((part) => part !== '')[1] : '';

  const [config, setConfig] = useLocalStorage<ConfigType>('edu-config', {});

  const [option, setOption] = useState(t(`${SETTINGS_APPSELECT_OPTIONS[0].id}.sidebar`));

  const formSchemaObject: { [key: string]: z.Schema } = {};

  SETTINGS_APPSELECT_OPTIONS.forEach((item) => {
    formSchemaObject[`${item.id}.path`] = z.string().optional();
    formSchemaObject[`${item.id}.appType`] = z.enum(['native', 'forwarded', 'embedded']).optional();
  });

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const settingsVisible = settingLocation !== '';

  useEffect(() => {
    if (settingsVisible) {
      setValue(`${settingLocation}.path`, config[`${settingLocation}`].linkPath);
      setValue(`${settingLocation}.appType`, config[`${settingLocation}`].appType);
    }
  }, [settingsVisible, settingLocation]);

  useEffect(() => {
    if (Object.keys(config).length === 0) {
      navigate('/settings');
    }
  }, [config]);

  const settingsForm = () => {
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = () => {
      const selectedOption = SETTINGS_APPSELECT_OPTIONS.find((item) => item.id.includes(settingLocation));

      if (selectedOption) {
        // TODO: Save config on server (eg mongoDB)
        setConfig(
          (prevConfig): ConfigType => ({
            ...prevConfig,
            [settingLocation]: {
              linkPath: getValues(`${settingLocation}.path`) as string,
              icon: selectedOption.icon,
              appType: getValues(`${settingLocation}.appType`) as 'native' | 'forwarded' | 'embedded',
            },
          }),
        );
        toast.success(`${t(`${settingLocation}.sidebar`)} - ${t('form.saved')}`, {
          description: new Date().toLocaleString(),
        });
      }
    };
    if (settingsVisible) {
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
                            <Input {...field} />
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
                                defaultValue={config[`${settingLocation}`].appType}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="native" />
                                  </FormControl>
                                  <p>{t('form.native')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="forwarded" />
                                  </FormControl>
                                  <p>{t('form.forwarded')}</p>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="embedded" />
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
                    <div className="absolute right-20">
                      <Button
                        type="submit"
                        variant="btn-collaboration"
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
    const existingOptions = Object.keys(config).map((key) => key);
    const filteredOptions = SETTINGS_APPSELECT_OPTIONS.filter((item) => !existingOptions.includes(item.id));

    return filteredOptions.map((item) => ({ id: item.id, name: `${item.id}.sidebar` }));
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
              className="m-7"
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
                    [option.toLowerCase().split('.')[0]]: { linkPath: '', icon: '', appType: 'native' },
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
      <Toaster />
    </>
  );
};

export default SettingsPage;
