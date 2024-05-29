import React from 'react';
import { t } from 'i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

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
