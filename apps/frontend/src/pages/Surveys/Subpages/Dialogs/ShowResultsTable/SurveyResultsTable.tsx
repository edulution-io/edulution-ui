'use client';

import React, { useState } from 'react';
import { Model } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import { SurveyAnswer } from '@/pages/Surveys/Subpages/components/types/survey-answer';

interface SurveyResultsTableProps {
  surveyFormula: string;
  answers: SurveyAnswer[];
}

const SurveyResultsTable = (props: SurveyResultsTableProps) => {
  const { surveyFormula, answers } = props;

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [surveyDataTable, setSurveyDataTable] = useState<Tabulator | undefined>(undefined);

  if (!survey) {
    const survey = new Model(surveyFormula);
    setSurvey(survey);
  }

  if (!surveyDataTable && !!survey) {
    const surveyDataTable = new Tabulator(
      survey,
      answers
    );
    setSurveyDataTable(surveyDataTable);
  }

  return (
    <div id="surveyDataTable" />
  );
}

export default SurveyResultsTable;
