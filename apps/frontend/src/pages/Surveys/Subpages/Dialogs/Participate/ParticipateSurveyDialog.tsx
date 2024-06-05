import React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator.tsx';
import { Survey as SurveyObject } from '@/pages/Surveys/Subpages/components/types/survey';
import ParticipateSurveyFormData from '@/pages/Surveys/Subpages/Dialogs/Participate/participate-survey-form.ts';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog.tsx';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore.ts';
import ParticipateSurveyDialogBody from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogBody.tsx';

interface ParticipateSurveyDialogProps {
  survey: SurveyObject;
  trigger?: React.ReactNode;
  updateOpenSurveys?: () => void;
  updateAnsweredSurveys?: () => void;
}

const ParticipateSurveyDialog = (props: ParticipateSurveyDialogProps) => {
  const { trigger, survey, updateOpenSurveys = () => {}, updateAnsweredSurveys = () => {} } = props;
  const {
    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
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

    if (!answer) {
      throw new Error('Invalid form data');
    }

    commitAnswer(survey.surveyname, answer, options);

    updateOpenSurveys();
    updateAnsweredSurveys();

    closeParticipateSurveyDialog();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (!survey) return null;
    if (isAnswering) return <LoadingIndicator isOpen={isAnswering} />;
    return (
      <>
        <ParticipateSurveyDialogBody
          surveyName={survey.surveyname}
          surveyFormula={survey.survey}
          isAnswering={isAnswering}
          handleFormSubmit={handleFormSubmit}
          form={form}
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

export default ParticipateSurveyDialog;
