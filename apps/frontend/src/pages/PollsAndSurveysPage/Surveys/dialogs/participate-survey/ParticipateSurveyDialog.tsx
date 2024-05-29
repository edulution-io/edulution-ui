import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {Survey as SurveyObject} from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import useParticipateSurveyDialogStore
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/participate-survey/ParticipateSurveyDialogStore';
import ParticipateSurveyFormData
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/participate-survey/participate-survey-form';
import ParticipateSurveyDialogBody
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/participate-survey/ParticipateSurveyDialogBody';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';

interface ParticipateSurveyDialogProps {
  isParticipateSurveyDialogOpen: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;

  shouldRefreshOpen: () => void;
  shouldRefreshParticipated: () => void;

  survey: SurveyObject;
  trigger?: React.ReactNode;
}

const ParticipateSurveyDialog = (props: ParticipateSurveyDialogProps) => {
  const {
    trigger,
    isParticipateSurveyDialogOpen,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,

    shouldRefreshOpen,
    shouldRefreshParticipated,

    survey,
  } = props;

  const {
    isAnswering,
    commitAnswer,
    error,
  } = useParticipateSurveyDialogStore();

  const { t } = useTranslation();

  const initialFormValues: ParticipateSurveyFormData = {
    answer: undefined,
    options: undefined,
  };

  const formSchema = z.object({
    answer: z.string(),
    options: z.any(),
  });

  const form = useForm<ParticipateSurveyFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const { answer, options } = form.getValues();

    if(!answer) {
      throw new Error('Invalid form data');
    }

    commitAnswer(survey.surveyname, answer, options);
    shouldRefreshOpen();
    shouldRefreshParticipated();
    closeParticipateSurveyDialog();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (!survey) return null;
    if (isAnswering) return <LoadingIndicator isOpen={isAnswering} />;
    return (
      <>
        <ParticipateSurveyDialogBody
          surveyName={ survey.surveyname }
          surveyFormula={ survey.survey }
          closeParticipateSurveyDialog={ closeParticipateSurveyDialog }
          isAnswering={ isAnswering }
          handleFormSubmit={ handleFormSubmit }
          form={ form }
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
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

  return (
    <AdaptiveDialog
      isOpen={isParticipateSurveyDialogOpen}
      trigger={trigger}
      handleOpenChange={isParticipateSurveyDialogOpen ? closeParticipateSurveyDialog : openParticipateSurveyDialog}
      title={t('survey.participation')}
      body={getDialogBody()}
      // footer={getFooter()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ParticipateSurveyDialog;
