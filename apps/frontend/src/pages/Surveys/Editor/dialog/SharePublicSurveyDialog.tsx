import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import { Button } from '@/components/shared/Button';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

const SharePublicSurveyDialog = () => {
  const { isOpenSharePublicSurveyDialog, closeSharePublicSurveyDialog, publicSurveyId } = useSurveyEditorPageStore();

  const { t } = useTranslation();

  const url = publicSurveyId ? `${window.location.origin}/${PUBLIC_SURVEYS}/${publicSurveyId}` : '';

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.info(t('surveys.sharePublicSurveyDialog.savedToClipboard'));
      })
      .catch(() => {
        toast.error(t('surveys.sharePublicSurveyDialog.savedToClipboardError'));
      });
  };

  const getDialogBody = () => (
    <>
      <p>{t('surveys.sharePublicSurveyDialog.description')}</p>
      <div className="flex flex-col items-center justify-center">
        <QRCodeDisplay value={url} />
        <div className="mb-4 mt-4 truncate rounded-xl bg-ciLightGrey px-2 py-1">{url}</div>
        <Button
          type="button"
          variant="btn-collaboration"
          onClick={() => copyToClipboard()}
        >
          {t('common.copy')}
        </Button>
      </div>
    </>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSharePublicSurveyDialog && !!url}
      handleOpenChange={() => closeSharePublicSurveyDialog()}
      title={t('surveys.sharePublicSurveyDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[60%] max-h-[75%] min-h-fit-content"
    />
  );
};

export default SharePublicSurveyDialog;
