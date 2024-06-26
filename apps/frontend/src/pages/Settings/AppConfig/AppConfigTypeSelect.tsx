import React from 'react';
import { Control } from 'react-hook-form';
import { findAppConfigByName } from '@/utils/common';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import { AppConfigDto } from '@libs/appconfig/types/appconfig.dto';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';

interface AppConfigTypeSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  settingLocation: string;
  appConfig: AppConfigDto[];
}

const AppConfigTypeSelect: React.FC<AppConfigTypeSelectProps> = ({ control, settingLocation, appConfig }) => {
  const radioGroupItems = [
    { value: AppIntegrationType.NATIVE, translationId: 'form.native' },
    { value: AppIntegrationType.FORWARDED, translationId: 'form.forwarded' },
    { value: AppIntegrationType.EMBEDDED, translationId: 'form.embedded' },
  ];

  return (
    <RadioGroupFormField
      control={control}
      name={`${settingLocation}.appType`}
      titleTranslationId="form.apptype"
      defaultValue={findAppConfigByName(appConfig, settingLocation)?.appType}
      items={radioGroupItems}
    />
  );
};

export default AppConfigTypeSelect;
