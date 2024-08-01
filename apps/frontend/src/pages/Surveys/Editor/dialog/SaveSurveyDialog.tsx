import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';

interface SaveSurveyDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  commitSurvey: () => void;
  isCommitting: boolean;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const { trigger, form, commitSurvey, isCommitting, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } = props;

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isCommitting) return <LoadingIndicator isOpen={isCommitting} />;
    return <SaveSurveyDialogBody form={form} />;
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={commitSurvey}>
        <Button
          type="submit"
          variant="btn-collaboration"
          disabled={isCommitting}
          size="lg"
        >
          {t('common.save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      trigger={trigger}
      handleOpenChange={() => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog)}
      title={t('surveys.saveDialog.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[50%] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
