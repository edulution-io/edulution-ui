import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';
import '@/pages/Survey/components/theme/creator.min.css';
import '@/pages/Survey/components/theme/default2.min.css';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import { defaultSurveyTheme } from '@/pages/Survey/components/theme/survey-theme';
import useParticipateSurveyDialogStore from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogStore';

const ParticipateSurvey = () => {
  const { selectedSurvey, setShouldRefresh } = useSurveyStore();
  const { answerSurvey, closeParticipateSurveyDialog } = useParticipateSurveyDialogStore();

  if (!selectedSurvey) {
    return null;
  }
  const surveyModel = new Model(selectedSurvey.survey);

  surveyModel.applyTheme(defaultSurveyTheme);

  surveyModel.onComplete.add(async function (sender, options) {
    answerSurvey(selectedSurvey.surveyname, JSON.stringify(sender.data), options);
    closeParticipateSurveyDialog();
    setShouldRefresh(true);
  });

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4">
      <Survey model={surveyModel} />
    </div>
  );
};

export default ParticipateSurvey;
