import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Survey from '@libs/survey/types/survey';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';

interface SurveyTableProps {
  title: string;
  surveys: Survey[];
  selectSurvey: (survey?: Survey) => void;
  selectedSurvey?: Survey;
}

const SURVEY_TABLE_HEADERS: string[] = ['Title', 'survey.creationDate', 'survey.expirationDate', 'participated'];

const SurveyTable = (props: SurveyTableProps) => {
  const { title, surveys, selectedSurvey, selectSurvey } = props;

  const { t } = useTranslation();

  const surveyRows = useMemo(
    () =>
      surveys.map((survey: Survey) => {
        // eslint-disable-next-line no-underscore-dangle
        const isSelectedSurvey = selectedSurvey?._id === survey._id;
        if (!survey.formula) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let surveyObj = JSON.parse(JSON.stringify(survey.formula));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!surveyObj.elements && !surveyObj.pages[0].elements) {
          surveyObj = undefined;
        }

        return (
          <TableRow
            // eslint-disable-next-line no-underscore-dangle
            key={`survey_row_-_${survey._id.toString('base64')}`}
            className="cursor-pointer"
            onClick={() => {
              selectSurvey(survey);
            }}
          >
            <TableCell>
              <Checkbox
                checked={isSelectedSurvey}
                aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
              />
            </TableCell>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <TableCell className="text-white">{surveyObj?.title || t('common.not-available')}</TableCell>
            <TableCell className="text-white">
              {survey?.created ? survey?.created.toString() : t('common.not-available')}
            </TableCell>
            <TableCell className="text-white">
              {survey?.expirationDate ? survey?.expirationDate.toString() : t('common.not-available')}
            </TableCell>
            <TableCell className="text-white">
              {survey?.participated?.length ? `${survey.participated.length}/` : ''}
              {survey?.participants?.length || 0}
            </TableCell>
          </TableRow>
        );
      }),
    [surveys, selectedSurvey],
  );

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <h4>{title}</h4>
      <Table>
        <TableHeader>
          <TableRow className="text-white">
            <TableHead
              key="tableHead-checkbox"
              className="w-20px"
            />
            {SURVEY_TABLE_HEADERS.map((header) => (
              <TableHead key={`tableHead-createdSurveys_${header}`}>{t(header)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="container">
          {surveys.length && surveys.length > 0 ? (
            surveyRows
          ) : (
            <TableRow>
              <TableCell
                colSpan={SURVEY_TABLE_HEADERS.length + 1} // +1 for the checkbox column
                className="h-24 text-center text-white"
              >
                {t('table.noDataAvailable')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SurveyTable;
