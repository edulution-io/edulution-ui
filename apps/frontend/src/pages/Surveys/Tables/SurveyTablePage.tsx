import React from 'react';
import SurveyDto from '@libs/survey/types/survey.dto';
import { ScrollArea } from '@/components/ui/ScrollArea';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveysTablesFloatingButtons from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';

interface SurveysTablePageProps {
  title: string;
  selectSurvey: (survey: SurveyDto | undefined) => void;
  selectedSurvey?: SurveyDto | undefined;
  surveys?: SurveyDto[];

  canEdit?: boolean;
  editSurvey?: () => void;
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
        <SurveysTablesFloatingButtons
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
