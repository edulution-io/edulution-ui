import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import { EDIT_SURVEY_PAGE, PARTICIPATE_SURVEY_PAGE } from '@libs/survey/constants/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useCommitedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useCommitedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';
import useDeleteSurveyStore from './useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit?: boolean;
  canDelete?: boolean;
  canParticipate?: boolean;
  canShowCommitedAnswers?: boolean;
  canShowResults?: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const {
    canEdit = false,
    canDelete = false,
    canShowCommitedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;

  const navigate = useNavigate();

  const { selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();

  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();

  const { setIsOpenCommitedAnswersDialog } = useCommitedAnswersDialogStore();

  const { deleteSurvey } = useDeleteSurveyStore();
  const handleDeleteSurvey = () => {
    if (selectedSurvey) {
      void deleteSurvey([selectedSurvey.id]);
      void updateUsersSurveys();
    }
  };

  const { t } = useTranslation();

  if (!selectedSurvey) {
    return null;
  }

  const addEditButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canEdit) {
      return buttonsList;
    }

    buttonsList.push(
      EditButton(() => {
        navigate(`/${EDIT_SURVEY_PAGE}/${selectedSurvey.id.toString('hex')}`);
      }),
    );
    return buttonsList;
  };
  const addDeleteButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canDelete) {
      return buttonsList;
    }
    buttonsList.push(DeleteButton(handleDeleteSurvey));
    return buttonsList;
  };
  const addShowCommitedAnswersButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canShowCommitedAnswers) {
      return buttonsList;
    }
    buttonsList.push({
      icon: HiOutlineArrowDownOnSquare,
      text: t('surveys.actions.showCommittedAnswers'),
      onClick: () => setIsOpenCommitedAnswersDialog(true),
    });
    return buttonsList;
  };

  const addParticipateButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canParticipate) {
      return buttonsList;
    }
    buttonsList.push({
      icon: AiOutlineUpSquare,
      text: t('common.participate'),
      onClick: () => {
        navigate(`/${PARTICIPATE_SURVEY_PAGE}/${selectedSurvey.id.toString('hex')}`);
      },
    });
    return buttonsList;
  };

  const addShowResultsTableButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canShowResults || !selectedSurvey?.canShowResultsTable) {
      return buttonsList;
    }
    buttonsList.push({
      icon: HiOutlineArrowDownOnSquareStack,
      text: t('surveys.actions.showResultsTable'),
      onClick: () => setIsOpenPublicResultsTableDialog(true),
    });
    return buttonsList;
  };

  const addShowResultsChartButton = (buttonsList: FloatingButtonConfig[]): FloatingButtonConfig[] => {
    if (!canShowResults || !selectedSurvey?.canShowResultsChart) {
      return buttonsList;
    }
    buttonsList.push({
      icon: HiOutlineArrowDownOnSquareStack,
      text: t('surveys.actions.showResultsChart'),
      onClick: () => setIsOpenPublicResultsVisualisationDialog(true),
    });
    return buttonsList;
  };

  let buttons: FloatingButtonConfig[] = [];
  buttons = addEditButton(buttons);
  buttons = addDeleteButton(buttons);
  buttons = addShowCommitedAnswersButton(buttons);
  buttons = addParticipateButton(buttons);
  buttons = addShowResultsTableButton(buttons);
  buttons = addShowResultsChartButton(buttons);

  const config: FloatingButtonsBarConfig = {
    buttons,
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
