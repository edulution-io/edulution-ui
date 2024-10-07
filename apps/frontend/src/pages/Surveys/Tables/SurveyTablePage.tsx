import React from 'react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveysTablesFloatingButtons from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import CommitedAnswersDialog from '@/pages/Surveys/Tables/dialogs/CommitedAnswersDialog';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SurveysTablePageProps {
  title: string;
  selectSurvey: (survey: SurveyDto | undefined) => void;
  selectedSurvey?: SurveyDto | undefined;
  surveys?: SurveyDto[];

  canEdit?: boolean;
  canDelete?: boolean;
  canShowCommitedAnswers?: boolean;
  canParticipate?: boolean;
  canShowResults?: boolean;
}

const SurveyTablePage = (props: SurveysTablePageProps) => {
  const {
    title,
    selectSurvey,
    selectedSurvey,
    surveys,

    canEdit = false,
    canDelete = false,
    canShowCommitedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden scrollbar-thin">
        <SurveyTable
          title={title}
          surveys={surveys || []}
          selectedSurvey={selectedSurvey}
          selectSurvey={selectSurvey}
        />
      </ScrollArea>
      {selectedSurvey ? (
        <SurveysTablesFloatingButtons
          canEdit={canEdit}
          canDelete={canDelete}
          canShowCommitedAnswers={canShowCommitedAnswers}
          canParticipate={canParticipate}
          canShowResults={canShowResults}
        />
      ) : null}
      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <ResultTableDialog />
          <ResultVisualizationDialog />
          <CommitedAnswersDialog />
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveyTablePage;
