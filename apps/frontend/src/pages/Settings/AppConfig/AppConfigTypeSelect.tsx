import React from 'react';
import { Control } from 'react-hook-form';
import RadioGroupFormField from '@/components/shared/RadioGroupFormField';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { EmbeddedIcon, ForwardIcon, NativeIcon } from '@/assets/icons';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';

interface AppConfigTypeSelectProps {
  control: Control;
  settingLocation: string;
  isNativeApp: boolean;
  defaultValue: AppIntegrationType;
}

const AppConfigTypeSelect: React.FC<AppConfigTypeSelectProps> = ({
  control,
  settingLocation,
  isNativeApp,
  defaultValue,
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
      defaultValue={defaultValue}
      items={radioGroupItems}
    />
  );
};

export default AppConfigTypeSelect;
