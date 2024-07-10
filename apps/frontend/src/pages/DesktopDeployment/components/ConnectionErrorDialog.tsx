import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

type ConnectionErrorProps = {
  isErrorDialogOpen: boolean;
  setIsErrorDialogOpen: (isErrorDialogOpen: boolean) => void;
  handleReload: () => void;
  trigger?: React.ReactNode;
};
const ConnectionErrorDialog: React.FC<ConnectionErrorProps> = ({
  isErrorDialogOpen,
  setIsErrorDialogOpen,
  handleReload,
  trigger,
}) => {
  const { t } = useTranslation();

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
        onClick={() => setIsErrorDialogOpen(false)}
      >
        {t('common.close')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isErrorDialogOpen}
      trigger={trigger}
      handleOpenChange={() => setIsErrorDialogOpen(false)}
      title={t('desktopdeployment.error.title')}
      body={getDialogBody()}
      desktopContentClassName="w-1/3"
      footer={getFooter()}
    />
  );
};

export default ConnectionErrorDialog;
