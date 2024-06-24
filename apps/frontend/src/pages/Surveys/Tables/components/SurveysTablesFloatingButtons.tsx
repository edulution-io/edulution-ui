import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit } from 'react-icons/fi';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import CommitedAnswer from '@/pages/Surveys/Tables/dialogs/CommitedAnswer';
import Participate from '@/pages/Surveys/Tables/dialogs/Participate';
import Result from '@/pages/Surveys/Tables/dialogs/Result';
import Delete from '@/pages/Surveys/Tables/components/Delete';

interface SurveysTablesDialogsProps {
  canEdit: boolean;
  editSurvey?: () => void;
  canDelete: boolean;
  canParticipate: boolean;
  canShowCommitedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesDialogs = (props: SurveysTablesDialogsProps) => {
  const { canEdit, editSurvey, canDelete, canShowCommitedAnswers, canParticipate, canShowResults } = props;

  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
        {canEdit ? (
          <FloatingActionButton
            icon={FiEdit}
            text={t('common.edit')}
            onClick={editSurvey}
          />
        ) : null}
        {canDelete ? <Delete /> : null}
        {canShowResults ? <Result /> : null}
        {canParticipate ? <Participate /> : null}
        {canShowCommitedAnswers ? <CommitedAnswer /> : null}
      </div>
    </TooltipProvider>
  );
};

export default SurveysTablesDialogs;
