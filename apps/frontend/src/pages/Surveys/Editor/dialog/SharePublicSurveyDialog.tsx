import React from 'react';
import { useTranslation } from 'react-i18next';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import QRCodeWithCopyButton from '@/components/ui/QRCodeWithCopyButton';

const SharePublicSurveyDialog = () => {
  const { isOpenSharePublicSurveyDialog, closeSharePublicSurveyDialog, publicSurveyId } = useSurveyEditorPageStore();

  const { t } = useTranslation();

  const url = publicSurveyId ? `${window.location.origin}/${PUBLIC_SURVEYS}/${publicSurveyId}` : '';

  const getDialogBody = () => (
    <QRCodeWithCopyButton
      url={url}
      titleTranslationId="surveys.sharePublicSurveyDialog.description"
      toasterTranslationIds={{
        success: 'surveys.sharePublicSurveyDialog.savedToClipboard',
        error: 'surveys.sharePublicSurveyDialog.savedToClipboardError',
      }}
    />
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
