'use client';

import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.min.css';

interface SurveyResultsTableProps {
  surveyFormula: string;
  answers: JSON[];
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
    const surveyDataTable = new Tabulator(survey, answers);
    setSurveyDataTable(surveyDataTable);
  }

  useEffect(() => {
    surveyDataTable?.render('surveyDataTable');
    const component = document.getElementById('surveyDataTable');
    if (component) {
      return () => {
        component.innerHTML = '';
      };
    }
  }, [surveyDataTable]);

  return <div id="surveyDataTable" />;
};

export default SurveyResultsTable;
