import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useDesktopDeploymentStore from '../DesktopDeploymentStore';

type ConnectionErrorProps = {
  handleReload: () => void;
};
const ConnectionErrorDialog: React.FC<ConnectionErrorProps> = ({ handleReload }) => {
  const { t } = useTranslation();
  const { error, setError } = useDesktopDeploymentStore();

  const getDialogBody = () => <p className="text-foreground">{t('desktopdeployment.error.description')}</p>;

  const getFooter = () => (
    <div className="mt-4 flex justify-between gap-5">
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        onClick={() => handleReload()}
      >
        {t('common.reload')}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        onClick={() => setError(null)}
      >
        {t('common.close')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={!!error}
      handleOpenChange={() => setError(null)}
      title={t('desktopdeployment.error.title')}
      body={getDialogBody()}
      desktopContentClassName="w-1/3"
      footer={getFooter()}
    />
  );
};

export default ConnectionErrorDialog;
