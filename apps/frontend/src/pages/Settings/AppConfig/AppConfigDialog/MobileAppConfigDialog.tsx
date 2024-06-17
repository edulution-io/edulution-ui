import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from '@/components/ui/Sheet';
import { Button } from '@/components/shared/Button';
import { DropdownMenu } from '@/components';
import { toast } from 'sonner';
import { AppConfig, AppIntegrationType } from '@/datatypes/types';
import { useTranslation } from 'react-i18next';
import useAppConfigsStore from '@/store/appConfigsStore';
import { SettingsDialogProps } from '@/pages/Settings/AppConfig/AppConfigDialog/settingTypes';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';

const MobileSettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
}) => {
  const { t } = useTranslation();
  const { appConfigs, updateAppConfig } = useAppConfigsStore();

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
              const optionsConfig = APP_CONFIG_OPTIONS.find((item) => item.id.includes(selectedOption));

              if (optionsConfig) {
                const newConfig: AppConfig = {
                  name: selectedOption,
                  icon: optionsConfig.icon,
                  appType: AppIntegrationType.FORWARDED,
                  options: {},
                };
                const updatedConfig = [...appConfigs, newConfig];

                updateAppConfig(updatedConfig)
                  .then(() =>
                    toast.success(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.success')}`),
                  )
                  .catch(() =>
                    toast.error(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.failed')}`),
                  );
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
