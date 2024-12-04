import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useDeleteSurveyStore from './useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  editSurvey?: () => void;
  canDelete: boolean;
  canParticipate: boolean;
  canShowSubmittedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const { canEdit, editSurvey, canDelete, canShowSubmittedAnswers, canParticipate, canShowResults } = props;

  const { selectedSurvey: survey, updateUsersSurveys } = useSurveyTablesPageStore();

  const canShowResultsTable = canShowResults && (survey?.canShowResultsTable || true);
  const canShowResultsChart = canShowResults && (survey?.canShowResultsChart || true);

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenParticipateSurveyDialog } = useParticipateDialogStore();

  const { setIsOpenSubmittedAnswersDialog } = useSubmittedAnswersDialogStore();

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
      EditButton(editSurvey ? () => editSurvey() : () => {}, canEdit),
      DeleteButton(handleDeleteSurvey, canDelete),
      {
        icon: HiOutlineArrowDownOnSquare,
        text: t('surveys.actions.showSubmittedAnswers'),
        onClick: () => setIsOpenSubmittedAnswersDialog(true),
        isVisible: canShowSubmittedAnswers,
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
        onClick: () => setIsOpenParticipateSurveyDialog(true),
        isVisible: canParticipate,
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-ciDarkGrey bg-opacity-90">
        <FloatingButtonsBar config={config} />
      </div>
    </TooltipProvider>
  );
};

export default SurveysTablesFloatingButtons;
