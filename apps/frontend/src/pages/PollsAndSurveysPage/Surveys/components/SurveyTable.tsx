import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { SurveyUpdateSelection } from '@/pages/PollsAndSurveysPage/Surveys/SurveyPageStore';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto';

interface SurveyTableProps {
  surveyType: UsersSurveysTypes;
  surveys: Survey[];
  title: string;
  isLoading: boolean;
  updateSurveySelection: (selection: SurveyUpdateSelection) => void;
}

const SurveyTable = (props: SurveyTableProps) => {
  const { surveyType, isLoading, title, surveys, updateSurveySelection } = props;

  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingIndicator isOpen={isLoading} />
  }

  if (surveys.length === 0) {
    return (
      <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
        <h4>{title}</h4>
        <ScrollArea>
          <div>{t('EMPTY')}</div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <h4>{title}</h4>
      <Table>
        <TableHeader>
          <TableRow className="text-2xl text-white">
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Participant count</TableHead>
            <TableHead>Page count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="container">
          {surveys.map((survey: Survey) => {
            if (!survey.survey) {
              return null;
            }
            const srv = JSON.parse(JSON.stringify(survey.survey));
            return (
              <TableRow
                key={`survey_row_-_${survey.surveyname}`}
                className="cursor-pointer"
                onClick={() => {
                  updateSurveySelection({survey, surveyType: surveyType});
                }}
              >
                <TableCell className="text-white">{srv.title}</TableCell>
                <TableCell className="text-white">{survey.created ? survey.created.toString() : 'not-available'}</TableCell>
                <TableCell className="text-white">{survey.participants.length || 0}</TableCell>
                <TableCell className="text-white">{srv.pages.length || 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SurveyTable;
