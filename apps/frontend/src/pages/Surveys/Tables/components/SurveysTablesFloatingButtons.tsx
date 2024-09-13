import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveysPageView from '@libs/survey/types/api/page-view';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useCommitedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useDeleteSurveyStore from './useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  canDelete: boolean;
  canParticipate: boolean;
  canShowCommitedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const { canEdit, canDelete, canShowCommitedAnswers, canParticipate, canShowResults } = props;

  const navigate = useNavigate();

  const { selectedSurvey: survey, updateUsersSurveys } = useSurveyTablesPageStore();

  const canShowResultsTable = canShowResults && (survey?.canShowResultsTable || true);
  const canShowResultsChart = canShowResults && (survey?.canShowResultsChart || true);

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenCommitedAnswersDialog } = useCommitedAnswersDialogStore();

  const { deleteSurvey } = useDeleteSurveyStore();

  const { t } = useTranslation();

  if (!survey) {
    return null;
  }

  const handleDeleteSurvey = () => {
    if (survey) {
      void deleteSurvey([survey.id]);
      void updateUsersSurveys();
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(
        canEdit
          ? () => navigate(`/${SURVEYS_ENDPOINT}${SurveysPageView.EDITOR}/${survey.id.toString('hex')}`)
          : () => {},
        canEdit,
      ),
      DeleteButton(handleDeleteSurvey, canDelete),
      {
        icon: HiOutlineArrowDownOnSquare,
        text: t('surveys.actions.showCommittedAnswers'),
        onClick: () => setIsOpenCommitedAnswersDialog(true),
        isVisible: canShowCommitedAnswers,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsTable'),
        onClick: () => setIsOpenPublicResultsTableDialog(true),
        isVisible: canShowResultsTable,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsChart'),
        onClick: () => setIsOpenPublicResultsVisualisationDialog(true),
        isVisible: canShowResultsChart,
      },
      {
        icon: AiOutlineUpSquare,
        text: t('common.participate'),
        onClick: canParticipate
          ? () => navigate(`/${SURVEYS_ENDPOINT}${SurveysPageView.PARTICIPATION}/${survey.id.toString('hex')}`)
          : () => {},
        isVisible: canParticipate,
      },
      {
        icon: HiOutlineArrowDownOnSquare,
        text: t('surveys.actions.showCommittedAnswers'),
        onClick: () => setIsOpenCommitedAnswersDialog(true),
        isVisible: canShowCommitedAnswers,
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
        <FloatingButtonsBar config={config} />
      </div>
    </TooltipProvider>
  );
};

export default SurveysTablesFloatingButtons;
