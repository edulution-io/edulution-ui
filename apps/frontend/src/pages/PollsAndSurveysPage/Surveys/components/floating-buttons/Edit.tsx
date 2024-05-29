import React from 'react';
import { t } from 'i18next';
import { FiEdit } from 'react-icons/fi';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

interface FloatingButtonEditSurveyProps {
  openEditSurveyDialog: () => void;
}

const FloatingButtonEditSurvey = (props: FloatingButtonEditSurveyProps) => {
  const { openEditSurveyDialog } = props;

  return (
    <FloatingActionButton
      icon={FiEdit}
      text={t('survey.edit')}
      onClick={openEditSurveyDialog}
    />
  );
};

export default FloatingButtonEditSurvey;
