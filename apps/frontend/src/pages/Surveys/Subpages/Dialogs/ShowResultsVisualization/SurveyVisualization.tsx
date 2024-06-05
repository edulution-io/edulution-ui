'use client';

import React, { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';
import '@/pages/Surveys/Subpages/components/theme/creator.min.css';
import '@/pages/Surveys/Subpages/components/theme/default2.min.css';
import './SurveyVisualization.css';

interface SurveyVisualizationProps {
  surveyFormula: string;
  answers: JSON[];
}

const SurveyVisualization = (props: SurveyVisualizationProps) => {
  const { surveyFormula, answers } = props;

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  if (!survey) {
    const survey = new Model(surveyFormula);
    survey.data = answers;
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
    const surveyVizPanel = new VisualizationPanel(surveyQuestions, answers, surveyVizPanelOptions);
    surveyVizPanel.locale = 'de';
    setVizPanel(surveyVizPanel);
  }, [survey, answers]);

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

export default SurveyVisualization;
