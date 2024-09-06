import React from 'react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysTablesFloatingButtons from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveyTableColumns from '@/pages/Surveys/Tables/components/SurveyTableColumns';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SurveysTablePageProps {
  title: string;
  selectedSurvey?: SurveyDto | undefined;
  surveys?: SurveyDto[];

  canEdit?: boolean;
  editSurvey?: () => void;
  canDelete?: boolean;
  canShowCommitedAnswers?: boolean;
  canParticipate?: boolean;
  participateSurvey?: () => void;
  canShowResults?: boolean;
}

const SurveyTablePage = (props: SurveysTablePageProps) => {
  const {
    title,
    selectedSurvey,
    surveys,

    canEdit = false,
    editSurvey = () => {},
    canDelete = false,
    canShowCommitedAnswers = false,
    canParticipate = false,
    participateSurvey = () => {},
    canShowResults = false,
  } = props;

  return (
    <>
      <h4>{title}</h4>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          columns={SurveyTableColumns}
          data={surveys || []}
        />
      </ScrollArea>
      {selectedSurvey ? (
        <SurveysTablesFloatingButtons
          canEdit={canEdit}
          editSurvey={editSurvey}
          canDelete={canDelete}
          canShowCommitedAnswers={canShowCommitedAnswers}
          canParticipate={canParticipate}
          participateSurvey={participateSurvey}
          canShowResults={canShowResults}
        />
      ) : null}
    </>
  );
};

export default SurveyTablePage;
