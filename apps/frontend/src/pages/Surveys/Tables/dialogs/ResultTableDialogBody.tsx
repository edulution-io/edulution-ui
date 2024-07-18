import React, { useState, useEffect } from 'react';
import i18next from 'i18next';
import { Model } from 'survey-core';
import { SurveyModel } from 'survey-core/typings/survey';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';

interface ResultTableDialogBodyProps {
  formula: JSON;
  result: JSON[];
}

const ResultTableDialogBody = (props: ResultTableDialogBodyProps) => {
  const { formula, result } = props;

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuTable, setVisuTable] = useState<Tabulator | null>(null);

  if (survey == null) {
    const surveyModel = new Model(formula);
    setSurvey(surveyModel);
  }

  if (visuTable == null && survey != null) {
    const surveyVisuTable = new Tabulator(survey, result);
    surveyVisuTable.locale = i18next.language;
    setVisuTable(surveyVisuTable);
  }

  useEffect(() => {
    visuTable?.render('surveyDashboardContainer');

    const component = document.getElementById('surveyDashboardContainer');
    return () => {
      if (component) {
        component.innerHTML = '';
      }
    };
  }, [visuTable]);

  return (
    <div className="max-h-[75vh] rounded bg-gray-600 p-4 text-foreground">
      <div id="surveyDashboardContainer" />
    </div>
  );
};

export default ResultTableDialogBody;
