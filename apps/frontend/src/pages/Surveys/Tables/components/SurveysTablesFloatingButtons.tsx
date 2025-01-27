import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import { EDIT_SURVEY_PAGE, PARTICIPATE_SURVEY_PAGE } from '@libs/survey/constants/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useDeleteSurveyStore from './useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  canDelete: boolean;
  canParticipate: boolean;
  canShowSubmittedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const {
    canEdit = false,
    canDelete = false,
    canShowSubmittedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;
  const { selectedSurvey, isNoSurveySelected, isExactlyOneSurveySelected, updateUsersSurveys, selectedRows } =
    useSurveyTablesPageStore();

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenSubmittedAnswersDialog } = useSubmittedAnswersDialogStore();

  const { deleteSurveys } = useDeleteSurveyStore();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const noSurveyIsSelected = isNoSurveySelected();
  if (noSurveyIsSelected) {
    return null;
  }

  const handleDeleteSurvey = () => {
    // TODO: Add confirmation dialog for the deletion ( Issue #368 (https://github.com/edulution-io/edulution-ui/issues/368) )
    const ids = Object.keys(selectedRows);
    if (ids) {
      void deleteSurveys(ids);
      void updateUsersSurveys();
    }
  };

  const isSingleSurveySelected = isExactlyOneSurveySelected();
  const canShowResultsTable = selectedSurvey?.canShowResultsTable && canShowResults;
  const canShowResultsChart = selectedSurvey?.canShowResultsChart && canShowResults;

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(() => {
        navigate(`/${EDIT_SURVEY_PAGE}/${selectedSurvey?.id.toString()}`);
      }, isSingleSurveySelected && canEdit),

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
        onClick: () => {
          navigate(`/${PARTICIPATE_SURVEY_PAGE}/${selectedSurvey?.id.toString()}`);
        },
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
