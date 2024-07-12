'use client';

import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';
import './ResultVisualizationDialogBody.css';

interface SurveyVisualizationProps {
  formula: JSON;
  result: JSON[];
}

const ResultVisualizationDialogBody = (props: SurveyVisualizationProps) => {
  const { formula, result } = props;

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  if (!survey) {
    const survey = new Model(formula);
    survey.data = result;
    setSurvey(survey);
  }

  useEffect(() => {
    const surveyQuestions = survey?.getAllQuestions();
    const surveyVizPanelOptions = {
      haveCommercialLicense: true,
      defaultChartType: 'bar',
      showToolbar: false,
    };
    if (!surveyQuestions) {
      return;
    }
    const surveyVizPanel = new VisualizationPanel(surveyQuestions, result, surveyVizPanelOptions);
    surveyVizPanel.locale = 'de';
    setVizPanel(surveyVizPanel);
  }, [survey, result]);

  useEffect(() => {
    vizPanel?.render('surveyVizPanel');
    const component = document.getElementById('surveyVizPanel');
    if (component) {
      return () => {
        component.innerHTML = '';
      };
    }
    return;
  }, [vizPanel]);

  return (
    <div className="max-h-[75vh] overflow-y-scroll rounded bg-gray-600 p-4 text-white">
      <div id="surveyVizPanel" />
    </div>
  );
};

export default ResultVisualizationDialogBody;
