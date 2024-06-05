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

      let surveyObj;
      try {
        surveyObj = JSON.parse(survey.survey);
        if (!surveyObj.elements && !surveyObj.pages[0].elements) {
          surveyObj = undefined;
          throw new Error('not able to parse the surveys string object');
        }
      } catch (e) {
        surveyObj = JSON.parse(JSON.stringify(survey.survey));
        if (!surveyObj.elements && !surveyObj.pages[0].elements) {
          surveyObj = undefined;
        }
      }

      if (!surveyObj) {
        return <>{t('survey.noFormula')}</>;
      }

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
          <TableCell className="text-white">{surveyObj?.title || t('not-available')}</TableCell>
          <TableCell className="text-white">
            {survey?.created ? survey?.created.toString() : t('not-available')}
          </TableCell>
          <TableCell className="text-white">
            {survey?.expires ? survey?.expires.toString() : t('not-available')}
          </TableCell>
          <TableCell className="text-white">
            {survey?.participated?.length ? `${ survey.participated.length }/` : ''}
            {survey?.participants?.length || 0}
          </TableCell>
        </TableRow>
      );
    }
  )), [surveys, selectedSurvey]);

  if (isLoading) {
    return <LoadingIndicator isOpen={isLoading} />;
  }

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <h4>{title}</h4>
      <Table>
        <TableHeader>
          <TableRow className="text-white">
            <TableHead key={`tableHead-checkbox`} className="w-20px">{ }</TableHead>
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
