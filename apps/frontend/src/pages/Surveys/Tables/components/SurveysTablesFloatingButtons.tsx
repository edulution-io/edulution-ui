import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useParticipateDialogStore from '@/pages/Surveys/Tables/dialogs/useParticpateDialogStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useDeleteSurveyStore from '../dialogs/useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  editSurvey?: () => void;
  canDelete: boolean;
  canParticipate: boolean;
  canShowSubmittedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = ({
  canEdit,
  editSurvey,
  canDelete,
  canParticipate,
  canShowSubmittedAnswers,
  canShowResults,
}: SurveysTablesFloatingButtonsProps) => {
  const { selectedSurvey, isNoSurveySelected, isExactlyOneSurveySelected, updateUsersSurveys, selectedRows } =
    useSurveyTablesPageStore();

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenParticipateSurveyDialog } = useParticipateDialogStore();

  const { setIsOpenSubmittedAnswersDialog } = useSubmittedAnswersDialogStore();

  const { setIsDeleteSurveysDialogOpen } = useDeleteSurveyStore();

  const { t } = useTranslation();

  const noSurveyIsSelected = isNoSurveySelected();
  if (noSurveyIsSelected) {
    return null;
  }

  const isSingleSurveySelected = isExactlyOneSurveySelected();
  const canShowResultsTable = selectedSurvey?.canShowResultsTable && canShowResults;
  const canShowResultsChart = selectedSurvey?.canShowResultsChart && canShowResults;

  const handleDeleteSurvey = () => {
    if (Object.keys(selectedRows).length > 0) {
      void setIsDeleteSurveysDialogOpen(true);
      void updateUsersSurveys();
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(editSurvey ? () => editSurvey() : () => {}, isSingleSurveySelected && canEdit),
      DeleteButton(handleDeleteSurvey, canDelete),
      {
        icon: HiOutlineArrowDownOnSquare,
        text: t('surveys.actions.showSubmittedAnswers'),
        onClick: () => setIsOpenSubmittedAnswersDialog(true),
        isVisible: isSingleSurveySelected && canShowSubmittedAnswers,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsTable'),
        onClick: () => setIsOpenPublicResultsTableDialog(true),
        isVisible: isSingleSurveySelected && canShowResultsTable,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsChart'),
        onClick: () => setIsOpenPublicResultsVisualisationDialog(true),
        isVisible: isSingleSurveySelected && canShowResultsChart,
      },
      {
        icon: AiOutlineUpSquare,
        text: t('common.participate'),
        onClick: () => setIsOpenParticipateSurveyDialog(true),
        isVisible: isSingleSurveySelected && canParticipate,
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-ciDarkGrey">
        <FloatingButtonsBar config={config} />
      </div>
    </TooltipProvider>
  );
};

export default SurveysTablesFloatingButtons;
