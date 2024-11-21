import React, { useMemo } from 'react';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';
import useElementHeight from '@/hooks/useElementHeight';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import SURVEYS_PAGE_TABLE_HEADER_ID from '@libs/survey/constants/pageElementIds';

interface SurveyTableProps {
  title: string;
  surveys: SurveyDto[];
  selectSurvey: (survey?: SurveyDto) => void;
  selectedSurvey?: SurveyDto;
}

const SURVEY_TABLE_HEADERS: string[] = [
  'common.title',
  'survey.creationDate',
  'survey.expirationDate',
  'common.participated',
  'survey.canSubmitMultiple',
];

const SurveyTable = (props: SurveyTableProps) => {
  const { title, surveys, selectedSurvey, selectSurvey } = props;

  const { t } = useTranslation('translation', { lng: i18n.options.lng || 'en' });

  const localDateFormat = getLocaleDateFormat();

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
            <TableCell className="text-background">{surveyObj?.title || t('common.not-available')}</TableCell>
            <TableCell className="text-background">
              {survey?.created ? format(survey.created, 'PPP', { locale: localDateFormat }) : t('common.not-available')}
            </TableCell>
            <TableCell className="text-background">
              {survey?.expires ? format(survey.expires, 'PPP', { locale: localDateFormat }) : t('common.not-available')}
            </TableCell>
            <TableCell className="text-background">
              {survey?.invitedAttendees && survey?.participatedAttendees && survey.isPublic !== true
                ? `${survey?.participatedAttendees.length || 0}/${survey?.invitedAttendees.length || 0}`
                : survey.answers.length}
            </TableCell>
            <TableCell className="text-background">
              {survey?.canSubmitMultipleAnswers ? t('common.yes') : t('common.no')}
            </TableCell>
          </TableRow>
        );
      }),
    [surveys, selectedSurvey],
  );

  const pageBarsHeight = useElementHeight([SURVEYS_PAGE_TABLE_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) - 10;

  return (
    <div
      className="m-4 w-full flex-1 overflow-auto pl-3 pr-3.5 scrollbar-thin"
      style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
    >
      <h4>{title}</h4>
      <Table>
        <TableHeader
          id={SURVEYS_PAGE_TABLE_HEADER_ID}
          className="text-white"
        >
          <TableRow>
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
                className="h-24 text-center text-background"
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
