import React from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from 'survey-core';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Survey } from '@/pages/Survey/backend-copy/model';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import UserSurveyTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';

interface SurveyTableProps {
  surveyType: UserSurveyTypes;
}

const SurveyTable = (props: SurveyTableProps) => {
  const { surveyType } = props;

  const { openSurveys, createdSurveys, answeredSurveys, allSurveys, setSelectedSurvey, setSelectedSurveyType } =
    useSurveyStore();
  const { t } = useTranslation();
  const title = () => {
    switch (surveyType) {
      case UserSurveyTypes.OPEN:
        return <h4>{`${t('survey.openSurveys')}`}</h4>;
      case UserSurveyTypes.CREATED:
        return <h4>{`${t('survey.createdSurveys')}`}</h4>;
      case UserSurveyTypes.ANSWERED:
        return <h4>{`${t('survey.answeredSurveys')}`}</h4>;
      case UserSurveyTypes.ALL:
        return <h4>{`${t('survey.allSurveys')}`}</h4>;
    }
  };
  const surveys = () => {
    switch (surveyType) {
      case UserSurveyTypes.OPEN:
        return openSurveys;
      case UserSurveyTypes.CREATED:
        return createdSurveys;
      case UserSurveyTypes.ANSWERED:
        return answeredSurveys;
      case UserSurveyTypes.ALL:
        return allSurveys;
    }
  };

  const currentTitle = title();
  const currentSurveys = surveys();

  if (!currentTitle || !currentSurveys || currentSurveys.length === 0) {
    return null;
  }

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      {currentTitle}
      <ScrollArea className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <Table>
          <TableHeader>
            <TableRow className="text-2xl text-white">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Participant count</TableHead>
              <TableHead>Page count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="container">
            {currentSurveys.map((survey: Survey) => {
              const surv = JSON.parse(JSON.stringify(survey.survey)) as Model;
              return (
                <TableRow
                  key={`survey_row_-_${survey.surveyname}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedSurveyType(surveyType);
                    setSelectedSurvey(survey);
                  }}
                >
                  <TableCell className="text-white">{surv.title}</TableCell>
                  <TableCell className="text-white">{survey.type}</TableCell>
                  <TableCell className="text-white">{survey.participants.length || 0}</TableCell>
                  <TableCell className="text-white">{surv.pages.length || 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default SurveyTable;
