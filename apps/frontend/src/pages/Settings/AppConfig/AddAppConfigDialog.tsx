import React from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { DropdownMenu } from '@/components';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/store/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import appIntegrationType from '@libs/appconfig/types/appIntegrationType';
import { AppConfigDto } from '@libs/appconfig/types/appconfig.dto';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { useNavigate } from 'react-router-dom';

interface AddAppConfigDialogProps {
  isOpen: boolean;
  option: string;
  setOption: (option: string) => void;
  filteredAppOptions: () => { id: string; name: string }[];
  setSearchParams: (params: URLSearchParams | ((prevParams: URLSearchParams) => URLSearchParams)) => void;
}

const AddAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({
  isOpen,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appConfigs, updateAppConfig, isLoading, error } = useAppConfigsStore();

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <div className="my-6 text-foreground">
        <p>{t('settings.addApp.description')}</p>
        <DropdownMenu
          options={filteredAppOptions()}
          selectedVal={t(option)}
          handleChange={setOption}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('conferences.error')}: {error.message}
          </div>
        ) : null}
      </div>
    );
  };

  const onSubmit = () => {
    const selectedOption = option.toLowerCase().split('.')[0];
    navigate(`/settings/${selectedOption}`);
    const optionsConfig = APP_CONFIG_OPTIONS.find((item) => item.id.includes(selectedOption));

    if (optionsConfig) {
      const newConfig: AppConfigDto = {
        name: selectedOption,
        icon: optionsConfig.icon,
        appType: appIntegrationType.FORWARDED,
        options: {},
      };
      const updatedConfig = [...appConfigs, newConfig];

      updateAppConfig(updatedConfig)
        .then(() => toast.success(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.success')}`))
        .catch(() => toast.error(`${t(`${selectedOption}.sidebar`)} - ${t('settings.appconfig.create.failed')}`));
    }
  };

  const dialogFooter = (
    <div className="mt-4 flex justify-end">
      <Button
        type="button"
        variant="btn-collaboration"
        size="lg"
        onClick={onSubmit}
      >
        {t('common.add')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => setSearchParams(new URLSearchParams(''))}
      title={t('settings.addApp.title')}
      body={getDialogBody()}
      footer={dialogFooter}
    />
  );
};

export default AddAppConfigDialog;
