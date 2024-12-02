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
  submitSurvey: () => void;
  isSubmitting: boolean;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const { trigger, form, submitSurvey, isSubmitting, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } = props;

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isSubmitting) return <LoadingIndicator isOpen={isSubmitting} />;
    return <SaveSurveyDialogBody form={form} />;
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSurvey();
        }}
      >
        <Button
          type="submit"
          variant="btn-collaboration"
          disabled={isSubmitting}
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
