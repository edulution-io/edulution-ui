import React from 'react';
import { Control } from 'react-hook-form';
import { findAppConfigByName } from '@/utils/common';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import { AppConfigDto } from '@libs/appconfig/types';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { EmbeddedIcon, ForwardIcon, NativeIcon } from '@/assets/icons';

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
    { value: APP_INTEGRATION_VARIANT.NATIVE, translationId: 'form.native', disabled: !isNativeApp, icon: NativeIcon },
    { value: APP_INTEGRATION_VARIANT.FORWARDED, translationId: 'form.forwarded', disabled: false, icon: ForwardIcon },
    { value: APP_INTEGRATION_VARIANT.EMBEDDED, translationId: 'form.embedded', disabled: false, icon: EmbeddedIcon },
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
