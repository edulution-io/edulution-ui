import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import PropagateSurveyDialogBody from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogBody';

interface PropagateSurveyDialogProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  propagateSurvey: () => void;
  isSaving: boolean;
  trigger?: React.ReactNode;
}

const PropagateSurveyDialog = (props: PropagateSurveyDialogProps) => {
  const {
    trigger,
    form,
    propagateSurvey,
    isSaving,
  } = props;
  const {
    isOpenPropagateSurveyDialog,
    openPropagateSurveyDialog,
    closePropagateSurveyDialog,
  } = usePropagateSurveyDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isSaving) return <LoadingIndicator isOpen={isSaving} />;
    return (<PropagateSurveyDialogBody form={form} />);
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={propagateSurvey}>
        <Button
          variant="btn-collaboration"
          disabled={isSaving}
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
      isOpen={isOpenPropagateSurveyDialog}
      trigger={trigger}
      handleOpenChange={isOpenPropagateSurveyDialog ? closePropagateSurveyDialog : openPropagateSurveyDialog}
      title={t('survey.editing')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default PropagateSurveyDialog;
