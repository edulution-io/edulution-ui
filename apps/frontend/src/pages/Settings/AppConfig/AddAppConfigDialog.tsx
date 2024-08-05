import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { DropdownMenu } from '@/components';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import { AppConfigDto, AppIntegrationType } from '@libs/appconfig/types';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { useNavigate } from 'react-router-dom';

interface AddAppConfigDialogProps {
  option: string;
  setOption: (option: string) => void;
  filteredAppOptions: () => { id: string; name: string }[];
}

const AddAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({ option, setOption, filteredAppOptions }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen, updateAppConfig, isLoading, error } =
    useAppConfigsStore();
  const selectedOption = option.toLowerCase().split('.')[0];

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <div className="my-6 text-foreground">
        <p>{t('settings.addApp.description')}</p>
        <DropdownMenu
          options={filteredAppOptions()}
          selectedVal={t(option)}
          handleChange={setOption}
          openToTop
        />
      </div>
    );
  };

  const onSubmit = async () => {
    if (!selectedOption) {
      return;
    }
    const optionsConfig = APP_CONFIG_OPTIONS.find((item) => item.id.includes(selectedOption));

    if (optionsConfig) {
      const newConfig: AppConfigDto = {
        name: selectedOption,
        icon: optionsConfig.icon,
        appType: AppIntegrationType.FORWARDED,
        options: {},
        accessGroups: [],
      };
      const updatedConfig = [...appConfigs, newConfig];

      await updateAppConfig(updatedConfig);
      if (!error) {
        setIsAddAppConfigDialogOpen(false);
      }
    }
  };

  useEffect(() => {
    if (!isAddAppConfigDialogOpen) {
      navigate(selectedOption ? `/settings/${selectedOption}` : '/settings', { replace: true });
    }
  }, [isAddAppConfigDialogOpen, setIsAddAppConfigDialogOpen]);

  const dialogFooter = (
    <div className="mt-4 flex justify-end">
      <Button
        type="button"
        variant="btn-collaboration"
        size="lg"
        onClick={onSubmit}
        disabled={isLoading || !selectedOption}
      >
        {t('common.add')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isAddAppConfigDialogOpen}
      handleOpenChange={() => setIsAddAppConfigDialogOpen(false)}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
      footer={dialogFooter}
    />
  );
};

export default AddAppConfigDialog;
