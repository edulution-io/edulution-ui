import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/shared/Button';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import { DropdownMenu } from '@/components';
import { AppIntegrationType } from '@/datatypes/types';
import { useTranslation } from 'react-i18next';
import useAppDataStore from '@/store/appDataStore';
import useAppConfigQuery from '@/api/useAppConfigQuery';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';

const MobileSettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
}) => {
  const { t } = useTranslation();
  const { config, setConfig } = useAppDataStore();
  const { updateSettingsConfig } = useAppConfigQuery();

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={() => setSearchParams(new URLSearchParams(''))}
    >
      <SheetTrigger asChild />
      <SheetContent
        side="bottom"
        className="flex flex-col"
      >
        <SheetHeader>{t('settings.addApp.title')}</SheetHeader>
        <SheetDescription className="bg-transparent">{t('settings.addApp.description')}</SheetDescription>
        <div className="pb-10 pt-2">
          <DropdownMenu
            options={filteredAppOptions()}
            selectedVal={t(option)}
            handleChange={setOption}
          />
        </div>
        <div className="container mx-auto flex justify-end p-4 sm:pr-10 md:right-20">
          <Button
            type="button"
            variant="btn-collaboration"
            size="lg"
            onClick={() => {
              setSearchParams(new URLSearchParams(''));
              const selectedOption = option.toLowerCase().split('.')[0];
              const optionsConfig = SETTINGS_APPSELECT_OPTIONS.find((item) => item.id.includes(selectedOption));

              if (optionsConfig) {
                const newConfig = {
                  name: selectedOption,
                  linkPath: '',
                  icon: optionsConfig.icon,
                  appType: AppIntegrationType.FORWARDED,
                };
                const updatedConfig = [...config, newConfig];

                setConfig(updatedConfig);
                updateSettingsConfig(updatedConfig).catch((e) => console.error('Update Config Error:', e));
              }
            }}
          >
            {t('common.add')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSettingsDialog;
