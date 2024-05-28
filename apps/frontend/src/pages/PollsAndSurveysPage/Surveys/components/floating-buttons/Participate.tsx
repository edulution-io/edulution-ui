import React from 'react';
import { t } from 'i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from '../../../FloatingActionButton.tsx';

interface FloatingButtonParticipateSurveyProps {
  openParticipateSurveyDialog: () => void;
}

const FloatingButtonParticipateSurvey = (props: FloatingButtonParticipateSurveyProps) => {
  const {openParticipateSurveyDialog} = props;

  return (
    <FloatingActionButton
      icon={AiOutlineUpSquare}
      text={t('survey.participate')}
      onClick={openParticipateSurveyDialog}
    />
  );
}

export default FloatingButtonParticipateSurvey;
