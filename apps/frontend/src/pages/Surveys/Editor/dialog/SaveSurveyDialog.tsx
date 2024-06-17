import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';

interface SaveSurveyDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isOpenSaveSurveyDialog: boolean;
  openSaveSurveyDialog: () => void;
  closeSaveSurveyDialog: () => void;
  commitSurvey: () => void;
  isCommitting: boolean;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const {
    trigger,
    form,
    commitSurvey,
    isCommitting,
    isOpenSaveSurveyDialog,
    openSaveSurveyDialog,
    closeSaveSurveyDialog,
  } = props;

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isCommitting) return <LoadingIndicator isOpen={isCommitting} />;
    return <SaveSurveyDialogBody form={form} />;
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={commitSurvey}>
        <Button
          variant="btn-collaboration"
          disabled={isCommitting}
          size="lg"
          type="submit"
        >
          {t('save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      trigger={trigger}
      handleOpenChange={isOpenSaveSurveyDialog ? closeSaveSurveyDialog : openSaveSurveyDialog}
      title={t('survey.editor.saveDialog.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
