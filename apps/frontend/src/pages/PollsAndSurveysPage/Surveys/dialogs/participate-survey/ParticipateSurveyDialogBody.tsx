import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import SurveyParticipation from '@/pages/PollsAndSurveysPage/Surveys/dialogs/participate-survey/SurveyParticipation.tsx';

interface ParticipateSurveyDialogBodyProps {
  surveyName: string;
  surveyFormula: string;
  closeParticipateSurveyDialog: () => void;
  isAnswering: boolean;

  handleFormSubmit: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const ParticipateSurveyDialogBody = (props: ParticipateSurveyDialogBodyProps) => {
  const {
    surveyName,
    surveyFormula,
    closeParticipateSurveyDialog,
    isAnswering,
    handleFormSubmit,
    form
  } = props;

  if (isAnswering) return <div>Loading...</div>;

  return (
    <SurveyParticipation
      surveyName={surveyName}
      surveyFormula={surveyFormula}
      closeParticipateSurveyDialog={closeParticipateSurveyDialog}

      handleFormSubmit={handleFormSubmit}

      form={form}
    />
  );
};

export default ParticipateSurveyDialogBody;
