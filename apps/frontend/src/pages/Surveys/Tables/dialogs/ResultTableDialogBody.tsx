import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';
import './ResultTableDialogBody.css';

interface SurveyVisualizationProps {
  formula: JSON;
  result: JSON[];
}

const ResultTableDialogBody = (props: SurveyVisualizationProps) => {
  const { formula, result } = props;

  const [vizTable, setVizTable] = useState<Tabulator | undefined>(undefined);

  const surveyModel = new Model(formula);

  useEffect((): void => {
    surveyModel.data = result;
    const surveyVizTable = new Tabulator(surveyModel, result);
    surveyVizTable.locale = 'de';
    setVizTable(surveyVizTable);
  }, [result]);

  useEffect((): void => {
    vizTable?.render('surveyDashboardContainer');
    const component = document.getElementById('surveyDashboardContainer');
    if (component) {
      component.innerHTML = '';
    }
  }, [vizTable]);

  return (
    <div className="max-h-[75vh] rounded bg-gray-600 p-4 text-white">
      <div id="surveyDashboardContainer" />
    </div>
  );
};

export default ResultTableDialogBody;
