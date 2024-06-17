import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { FiDelete, FiEdit } from 'react-icons/fi';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import Survey from '@libs/survey/types/survey';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';

interface SurveysTablePageProps {
  title: string;
  selectSurvey: (survey: Survey | undefined) => void;
  selectedSurvey?: Survey | undefined;
  surveys?: Survey[];

  updateOpenSurveys?: () => void;
  updateCreatedSurveys?: () => void;
  updateAnsweredSurveys?: () => void;

  canEdit?: boolean;
  editSurvey?: () => void;

  canDelete?: boolean;
  deleteSurvey?: (surveyID: number) => void;

  canShowCommitedAnswers?: boolean;
  openCommitedAnswersDialog?: () => void;

  canParticipate?: boolean;
  openParticipateSurveyDialog?: () => void;

  canShowResults?: boolean;
  openPublicResultsTableDialog?: () => void;
  openPublicResultsVisualisationDialog?: () => void;
}

const SurveyTablePage = (props: SurveysTablePageProps) => {
  const {
    title,
    selectSurvey,
    selectedSurvey,
    surveys,

    updateOpenSurveys = () => {},
    updateCreatedSurveys = () => {},
    updateAnsweredSurveys = () => {},

    canEdit = false,
    editSurvey = () => {},

    canDelete = false,
    deleteSurvey = () => {},

    canShowCommitedAnswers = false,
    openCommitedAnswersDialog = () => {},

    canParticipate = false,
    openParticipateSurveyDialog = () => {},

    canShowResults = false,
    openPublicResultsTableDialog = () => {},
    openPublicResultsVisualisationDialog = () => {},
  } = props;

  const {t} = useTranslation();

  const editButton = useMemo(() => {
    if (selectedSurvey && canEdit) {
      return (
        <FloatingActionButton
          icon={FiEdit}
          text={t('common.edit')}
          onClick={editSurvey}
        />
      );
    }
    return null;
  }, [selectedSurvey, canEdit]);

  const deleteButton = useMemo(() => {
    if (selectedSurvey && canDelete) {
      return (
        <FloatingActionButton
          icon={FiDelete}
          text={t('common.delete')}
          onClick={() => {
            deleteSurvey(selectedSurvey?.id);
            updateOpenSurveys();
            updateCreatedSurveys();
            updateAnsweredSurveys();
          }}
        />
      );
    }
    return null;
  }, [selectedSurvey, canDelete]);

  const resultsChartButton = useMemo(() => {
    if ( selectedSurvey /* ?.canShowResultsChart */ &&  canShowResults) {
      return (
        <FloatingActionButton
          icon={HiOutlineArrowDownOnSquareStack}
          text={t('surveys.actions.showResultsChart')}
          onClick={openPublicResultsVisualisationDialog}
        />
      );
    }
    return null;
  }, [selectedSurvey, canShowResults]);

  const resultsTableButton = useMemo(() => {
    if ( selectedSurvey /* ?.canShowResultsTable */ &&  canShowResults) {
      return (
        <FloatingActionButton
          icon={HiOutlineArrowDownOnSquareStack}
          text={t('surveys.actions.showResultsTable')}
          onClick={openPublicResultsTableDialog}
        />
      );
    }
    return null;
  }, [selectedSurvey, canShowResults]);

  const participateButton = useMemo(() => {
    if (selectedSurvey && canParticipate) {
      return (
        <FloatingActionButton
          icon={AiOutlineUpSquare}
          text={t('common.participate')}
          onClick={openParticipateSurveyDialog}
        />
      );
    }
    return null;
  }, [selectedSurvey, canParticipate]);

  const commitedAnswersButton = useMemo(() => {
    if (selectedSurvey && canShowCommitedAnswers) {
      return (
        <FloatingActionButton
          icon={HiOutlineArrowDownOnSquare}
          text={t('surveys.actions.showCommittedAnswers')}
          onClick={openCommitedAnswersDialog}
        />
      );
    }
    return null;
  }, [selectedSurvey, canShowCommitedAnswers]);

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          title={title}
          surveys={surveys || []}
          selectedSurvey={selectedSurvey}
          selectSurvey={selectSurvey}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          {editButton}
          {deleteButton}
          {resultsChartButton}
          {resultsTableButton}
          {participateButton}
          {commitedAnswersButton}
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveyTablePage;
