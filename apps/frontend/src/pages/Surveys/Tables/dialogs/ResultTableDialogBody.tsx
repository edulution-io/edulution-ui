import React, { useState, useEffect } from 'react';
import i18next from 'i18next';
import { Model } from 'survey-core';
import { SurveyModel } from 'survey-core/typings/survey';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
// import './ResultTableDialogBody.css';

interface ResultTableDialogBodyProps {
  formula: JSON;
  result: JSON[];
}

const ResultTableDialogBody = (props: ResultTableDialogBodyProps) => {
  const { formula, result } = props;

  const [survey, setSurvey] = useState<SurveyModel | undefined>(undefined);
  const [vizTable, setVizTable] = useState<Tabulator | undefined>(undefined);

  if (!survey) {
    const surveyModel = new Model(formula);
    setSurvey(surveyModel);
  }

  if (!vizTable && !!survey) {
    const surveyVizTable = new Tabulator(survey, result);
    surveyVizTable.locale = i18next.language;
    setVizTable(surveyVizTable);
  }

  useEffect(() => {
    vizTable?.render('surveyDashboardContainer');

    const component = document.getElementById('surveyDashboardContainer');
    return () => {
      if (component) {
        component.innerHTML = '';
      }
    }
  }, [vizTable]);

  return (
    <div className="max-h-[75vh] rounded bg-gray-600 p-4 text-black">
      <div id="surveyDashboardContainer"/>
    </div>
  );
}

export default ResultTableDialogBody;
