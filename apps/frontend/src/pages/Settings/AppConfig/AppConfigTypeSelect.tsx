import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { FormControl, FormItem, FormMessage } from '@/components/ui/Form';
import { AppConfig, AppIntegrationType } from '@/datatypes/types';
import { findAppConfigByName } from '@/utils/common';

interface AppConfigTypeSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  settingLocation: string;
  appConfig: AppConfig[];
}

const AppConfigTypeSelect: React.FC<AppConfigTypeSelectProps> = ({ control, settingLocation, appConfig }) => {
  const { t } = useTranslation();

  return (
    <FormItem className="space-y-3">
      <h4>{t('form.apptype')}</h4>
      <FormControl>
        <Controller
          control={control}
          name={`${settingLocation}.appType`}
          render={({ field }) => (
            <RadioGroupSH
              onValueChange={field.onChange}
              defaultValue={findAppConfigByName(appConfig, settingLocation)?.appType}
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
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default AppConfigTypeSelect;
