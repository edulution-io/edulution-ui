import React from 'react';
import { t } from 'i18next';
import { AiOutlineDownSquare } from 'react-icons/ai';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

interface FloatingButtonOpenAnswerSurveyProps {
  openSurveyResultsDialog: () => void;
}

const FloatingButtonOpenAnswerSurvey = (props: FloatingButtonOpenAnswerSurveyProps) => {
  const {openSurveyResultsDialog} = props;

  return (
    <FloatingActionButton
      icon={AiOutlineDownSquare}
      text={t('survey.result')}
      onClick={openSurveyResultsDialog}
    />
  );
}

export default FloatingButtonOpenAnswerSurvey;
