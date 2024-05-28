import React from 'react';
import { t } from 'i18next';
import { AiOutlinePlusSquare } from 'react-icons/ai';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

interface FloatingButtonCreateSurveyProps {
  setSelectedSurvey: (survey: Survey | undefined) => void;
  openEditSurveyDialog: () => void;
}

const FloatingButtonCreateSurvey = (props: FloatingButtonCreateSurveyProps) => {
  const {setSelectedSurvey, openEditSurveyDialog} = props;

  return (
    <FloatingActionButton
      icon={AiOutlinePlusSquare}
      text={t('survey.create')}
      onClick={() => {
        setSelectedSurvey(undefined);
        openEditSurveyDialog();
      }}
    />
  );
}

export default FloatingButtonCreateSurvey;
