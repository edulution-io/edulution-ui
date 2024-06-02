import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import SurveyParticipation from '@/pages/Surveys/Subpages/Dialogs/Participate/SurveyParticipation.tsx';

interface ParticipateSurveyDialogBodyProps {
  surveyName: string;
  surveyFormula: string;
  isAnswering: boolean;
  handleFormSubmit: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const ParticipateSurveyDialogBody = (props: ParticipateSurveyDialogBodyProps) => {
  const { surveyName, surveyFormula, isAnswering, handleFormSubmit, form } = props;

  if (isAnswering) return <div>Loading...</div>;

  return (
    <SurveyParticipation
      surveyName={surveyName}
      surveyFormula={surveyFormula}
      handleFormSubmit={handleFormSubmit}
      form={form}
    />
  );
};

export default ParticipateSurveyDialogBody;
