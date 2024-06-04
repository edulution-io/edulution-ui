import React, {useMemo} from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '@/components/ui/Checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import SurveyTableHeaders from '@/pages/Surveys/Subpages/components/table/survey-table-table-headers';

interface SurveyTableProps {
  title: string;
  surveys: Survey[];
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (survey: Survey | undefined) => void;
  isLoading: boolean;
}

const SurveyTable = (props: SurveyTableProps) => {
  const { title, surveys, selectedSurvey, setSelectedSurvey, isLoading } = props;

  const { t } = useTranslation();

  const surveyRows = useMemo(() => (
    surveys.map((survey: Survey) => {
      const isSelectedSurvey = selectedSurvey?.surveyname === survey.surveyname;
      if (!survey.survey) {
        return null;
      }
      try {
        const srv = JSON.parse(survey.survey);
        return (
          <TableRow
            key={`survey_row_-_${survey.surveyname}`}
            className="cursor-pointer"
            onClick={() => {
              setSelectedSurvey(survey);
            }}
          >
            <TableCell>
              <Checkbox
                checked={isSelectedSurvey}
                aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
              />
            </TableCell>
            <TableCell className="text-white">{srv?.title || 'undefined'}</TableCell>
            <TableCell className="text-white">
              {survey?.created ? survey?.created.toString() : 'not-available'}
            </TableCell>
            <TableCell className="text-white">
              {/* {survey?.participated?.length ? `${ survey.participated.length }/` : ''} */}
              {survey?.participants?.length || 0}
            </TableCell>
            <TableCell className="text-white">{srv?.pages?.length || 0}</TableCell>
          </TableRow>
        );
      } catch (e) {
        const srv = JSON.parse(JSON.stringify(survey.survey));
        return (
          <TableRow
            key={`survey_row_-_${survey.surveyname}`}
            className="cursor-pointer"
            onClick={() => {
              setSelectedSurvey(survey);
            }}
          >
            <TableCell>
              <Checkbox
                checked={isSelectedSurvey}
                aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
              />
            </TableCell>
            <TableCell className="text-white">{srv?.title || 'undefined'}</TableCell>
            <TableCell className="text-white">
              {survey?.created ? survey?.created.toString() : 'not-available'}
            </TableCell>
            <TableCell className="text-white">{survey?.participants?.length || 0}</TableCell>
            <TableCell className="text-white">{srv?.pages?.length || 0}</TableCell>
          </TableRow>
        );
      }
    }
  )), [surveys]);

  if (isLoading) {
    return <LoadingIndicator isOpen={isLoading} />;
  }

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <h4>{title}</h4>
      <Table>
        <TableHeader>
          <TableRow className="text-white">
            <TableHead key={`tableHead-checkbox`} className="w-20px">
            </TableHead>
            {SurveyTableHeaders.map((header) => (
              <TableHead key={`tableHead-createdSurveys_${header}`}>{t(header)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="container">
          {surveyRows}
        </TableBody>
      </Table>
    </div>
  );
};

export default SurveyTable;
