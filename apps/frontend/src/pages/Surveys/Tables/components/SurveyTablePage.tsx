import React from 'react';
import Survey from '@libs/survey/types/survey';
import { ScrollArea } from '@/components/ui/ScrollArea';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveysTablesDialogs from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';

interface SurveysTablePageProps {
  title: string;
  selectSurvey: (survey: Survey | undefined) => void;
  selectedSurvey?: Survey | undefined;
  surveys?: Survey[];

  // updateOpenSurveys?: () => void;
  // updateCreatedSurveys?: () => void;
  // updateAnsweredSurveys?: () => void;

  canEdit?: boolean;
  editSurvey?: () => void;

  canDelete?: boolean;
  // deleteSurvey?: (surveyID: number) => void;

  canShowCommitedAnswers?: boolean;
  // openCommitedAnswersDialog?: () => void;

  canParticipate?: boolean;
  // openParticipateSurveyDialog?: () => void;

  canShowResults?: boolean;
  // openPublicResultsTableDialog?: () => void;
  // openPublicResultsVisualisationDialog?: () => void;
}

const SurveyTablePage = (props: SurveysTablePageProps) => {
  const {
    title,
    selectSurvey,
    selectedSurvey,
    surveys,

    canEdit = false,
    editSurvey = () => {},
    canDelete = false,
    canShowCommitedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;

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
      {selectedSurvey ? (
        <SurveysTablesDialogs
          // survey={selectedSurvey}
          canEdit={canEdit}
          editSurvey={editSurvey}
          canDelete={canDelete}
          canShowCommitedAnswers={canShowCommitedAnswers}
          canParticipate={canParticipate}
          canShowResults={canShowResults}
        />
      ) : null}
    </>
  );
};

export default SurveyTablePage;
