import React from 'react';
import { Control } from 'react-hook-form';
import { findAppConfigByName } from '@/utils/common';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';

interface AppConfigTypeSelectProps {
  control: Control;
  settingLocation: string;
  appConfig: AppConfigDto[];
  isNativeApp: boolean;
}

const AppConfigTypeSelect: React.FC<AppConfigTypeSelectProps> = ({
  control,
  settingLocation,
  appConfig,
  isNativeApp,
}) => {
  const radioGroupItems = [
    { value: AppIntegrationType.NATIVE, translationId: 'form.native', disabled: !isNativeApp },
    { value: AppIntegrationType.FORWARDED, translationId: 'form.forwarded', disabled: false },
    { value: AppIntegrationType.EMBEDDED, translationId: 'form.embedded', disabled: false },
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
