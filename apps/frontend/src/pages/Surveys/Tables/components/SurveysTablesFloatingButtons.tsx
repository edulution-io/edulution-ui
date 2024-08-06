import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useCommitedAnswersDialogStore';
import DeleteSurveyButton from '@/pages/Surveys/Tables/components/DeleteSurveyButton';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { TooltipProvider } from '@/components/ui/Tooltip';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  editSurvey?: () => void;
  canDelete: boolean;
  canParticipate: boolean;
  canShowCommitedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const { canEdit, editSurvey, canDelete, canShowCommitedAnswers, canParticipate, canShowResults } = props;

  const { selectedSurvey: survey } = useSurveyTablesPageStore();

  const canShowResultsTable = canShowResults && (survey?.canShowResultsTable || true);
  const canShowResultsChart = canShowResults && (survey?.canShowResultsChart || true);

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenParticipateSurveyDialog } = useParticipateDialogStore();

  const { setIsOpenCommitedAnswersDialog } = useCommitedAnswersDialogStore();

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
        {canDelete ? <DeleteSurveyButton /> : null}
        {canShowResultsTable ? (
          <FloatingActionButton
            icon={HiOutlineArrowDownOnSquareStack}
            text={t('surveys.actions.showResultsTable')}
            onClick={() => setIsOpenPublicResultsTableDialog(true)}
          />
        ) : null}
        {canShowResultsChart ? (
          <FloatingActionButton
            icon={HiOutlineArrowDownOnSquareStack}
            text={t('surveys.actions.showResultsChart')}
            onClick={() => setIsOpenPublicResultsVisualisationDialog(true)}
          />
        ) : null}
        {canParticipate ? (
          <FloatingActionButton
            icon={AiOutlineUpSquare}
            text={t('common.participate')}
            onClick={() => setIsOpenParticipateSurveyDialog(true)}
          />
        ) : null}
        {canShowCommitedAnswers ? (
          <FloatingActionButton
            icon={HiOutlineArrowDownOnSquare}
            text={t('surveys.actions.showCommittedAnswers')}
            onClick={() => setIsOpenCommitedAnswersDialog(true)}
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
};

export default SurveysTablesFloatingButtons;
