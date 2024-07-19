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
  setIsOpenParticipateSurveyDialog: (state: boolean) => void;
  commitAnswer: (surveyId: mongoose.Types.ObjectId, answer: JSON, options?: CompleteEvent) => Promise<void>;
  isLoading: boolean;

  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;

  trigger?: React.ReactNode;
}

const ParticipateDialog = (props: ParticipateDialogProps) => {
  const {
    survey,

    isOpenParticipateSurveyDialog,
    setIsOpenParticipateSurveyDialog,
    commitAnswer,
    isLoading,

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
      toast.error(t('surveys.errors.noAnswerForSubmission'));
      return;
    }

    try {
      await commitAnswer(survey.id, answer, options);
      setIsOpenParticipateSurveyDialog(false);
      updateOpenSurveys();
      updateAnsweredSurveys();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '');
    }
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (!survey) return null;
    return (
      <ParticipateDialogBody
        formula={survey.formula}
        handleFormSubmit={handleFormSubmit}
        form={form}
      />
    );
  };

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      {isOpenParticipateSurveyDialog ? (
        <AdaptiveDialog
          isOpen={isOpenParticipateSurveyDialog}
          trigger={trigger}
          handleOpenChange={() => setIsOpenParticipateSurveyDialog(!isOpenParticipateSurveyDialog)}
          title={t('surveys.participateDialog.title')}
          body={getDialogBody()}
          desktopContentClassName="max-w-[75%]"
        />
      ) : null}
    </>
  );
};

export default ParticipateDialog;
