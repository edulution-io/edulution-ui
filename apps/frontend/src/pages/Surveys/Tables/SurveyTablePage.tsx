import React from 'react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveyTableColumns from '@/pages/Surveys/Tables/components/SurveyTableColumns';
import SurveysTablesFloatingButtons from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface SurveysTablePageProps {
  title: string;
  description: string;
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
    description,
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
      <div className="py-2">
        <p className="text-background">{title}</p>
        <p className="text-sm font-normal text-gray-500">{description}</p>
      </div>
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
          canShowResults={canShowResults}
        />
      ) : null}
    </>
  );
};

export default SurveyTablePage;
