import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/survey.dto';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';

interface SurveyTableProps {
  title: string;
  surveys: SurveyDto[];
  selectSurvey: (survey?: SurveyDto) => void;
  selectedSurvey?: SurveyDto;
}

const SURVEY_TABLE_HEADERS: string[] = ['Title', 'survey.creationDate', 'survey.expirationDate', 'participated'];

const SurveyTable = (props: SurveyTableProps) => {
  const { title, surveys, selectedSurvey, selectSurvey } = props;

  const { t } = useTranslation();

  const surveyRows = useMemo(
    () =>
      surveys.map((survey: SurveyDto) => {
        const isSelectedSurvey = selectedSurvey?.id === survey.id;
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
            key={`survey_row_-_${survey.id.toString('base64')}`}
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