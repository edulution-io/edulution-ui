import mongoose from 'mongoose';
import React from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { CompleteEvent } from 'survey-core';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import SurveyDto from '@libs/survey/types/survey.dto';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ParticipateDialogBody from '@/pages/Surveys/Tables/dialogs/ParticipateDialogBody';

interface ParticipateDialogFormData {
  answer: JSON | undefined;
  options: CompleteEvent | undefined;
}

interface ParticipateDialogProps {
  survey: SurveyDto;

  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;
  commitAnswer: (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent) => Promise<string>;
  isLoading: boolean;
  error: Error | null;

  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;

  trigger?: React.ReactNode;
}

const ParticipateDialog = (props: ParticipateDialogProps) => {
  const {
    survey,

    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    commitAnswer,
    isLoading,
    error,

    updateOpenSurveys,
    updateAnsweredSurveys,

    trigger,
  } = props;

  const { t } = useTranslation();

  const initialFormValues: ParticipateDialogFormData = {
    answer: undefined,
    options: undefined,
  };

  const formSchema = z.object({
    answer: z.any(),
    options: z.any(),
  });

  const form = useForm<ParticipateDialogFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const { answer, options } = form.getValues();

    if (!answer) {
      throw new Error('Invalid form data');
    }

    try {
      await commitAnswer(survey.id, answer, options);
      closeParticipateSurveyDialog();
      updateOpenSurveys();
      updateAnsweredSurveys();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '');
    }
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (!survey) return null;
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <>
        <ParticipateDialogBody
          formula={survey.formula}
          handleFormSubmit={handleFormSubmit}
          form={form}
        />
        {error ? toast.error(t(error.message)) : null}
      </>
    );
  };

  // const getFooter = () => (
  //   <div className="mt-4 flex justify-end">
  //     <form onSubmit={handleFormSubmit}>
  //       <Button
  //         variant="btn-collaboration"
  //         disabled={isAnswering}
  //         size="lg"
  //         type="submit"
  //       >
  //         {t('save')}
  //       </Button>
  //     </form>
  //   </div>
  // );

  if (!isOpenParticipateSurveyDialog) return null;

  return (
    <AdaptiveDialog
      isOpen={isOpenParticipateSurveyDialog}
      trigger={trigger}
      handleOpenChange={isOpenParticipateSurveyDialog ? closeParticipateSurveyDialog : openParticipateSurveyDialog}
      title={t('survey.participation')}
      body={getDialogBody()}
      // footer={getFooter()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ParticipateDialog;