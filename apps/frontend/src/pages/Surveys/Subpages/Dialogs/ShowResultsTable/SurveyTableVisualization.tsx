'use client';

import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import '@/pages/Surveys/Subpages/components/theme/creator.min.css';
import '@/pages/Surveys/Subpages/components/theme/default2.min.css';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
import './SurveyTableVisualization.css'

interface SurveyTableVisualizationProps {
  surveyFormula: string;
  answers: JSON[];
}

const SurveyTableVisualization = (props: SurveyTableVisualizationProps) => {
  const { surveyFormula, answers } = props;

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizTable, setVizTable] = useState<Tabulator | undefined>(undefined);

  if (!survey) {
    const survey = new Model(surveyFormula);
    survey.data = answers;
    setSurvey(survey);
  }

  useEffect(() => {
    if (!survey) {
      return;
    }
    const surveyVizTable = new Tabulator(survey, answers);
    surveyVizTable.locale = 'de';
    setVizTable(surveyVizTable);
  }, [survey, answers]);


  useEffect(() => {
    vizTable?.render('surveyDashboardContainer');
    const component = document.getElementById('surveyDashboardContainer');
    if (component) {
      return () => {
        component.innerHTML = '';
      };
    }
    return;
  }, [vizTable]);

  return (
    <div className="max-h-[75vh] rounded bg-gray-600 p-4 text-white">
      <div id="surveyDashboardContainer"/>
    </div>
  );
};

export default SurveyTableVisualization;
