import React, { useState, useEffect } from 'react';
import i18next from 'i18next';
import { Model } from 'survey-core';
import { SurveyModel } from 'survey-core/typings/survey';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';

const visuPanelOptions = {
  haveCommercialLicense: true,
  defaultChartType: 'bar',
  showToolbar: false,
  allowDynamicLayout: false,
  allowHideQuestions: false,
};

interface ResultVisualizationDialogBodyProps {
  formula: JSON;
  result: JSON[];
}

const ResultVisualizationDialogBody = (props: ResultVisualizationDialogBodyProps) => {
  const { formula, result } = props;

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuPanel, setVisuPanel] = useState<VisualizationPanel | null>(null);

  if (survey == null) {
    const surveyModel = new Model(formula);
    setSurvey(surveyModel);
  }

  if (visuPanel == null && survey != null) {
    const questions = survey.getAllQuestions() || [];
    const answers = result || [];
    const visualizationPanel = new VisualizationPanel(questions, answers, visuPanelOptions);
    visualizationPanel.locale = i18next.language;
    visualizationPanel.showToolbar = false;
    setVisuPanel(visualizationPanel);
  }

  useEffect(() => {
    visuPanel?.render('surveyVisuPanel');

    const component = document.getElementById('surveyVisuPanel');
    return () => {
      if (component) {
        component.innerHTML = '';
      }
    };
  }, [visuPanel]);

  return (
    <div className="rounded bg-ciLightGrey">
      <div id="surveyVisuPanel" />
    </div>
  );
};

export default ResultVisualizationDialogBody;
