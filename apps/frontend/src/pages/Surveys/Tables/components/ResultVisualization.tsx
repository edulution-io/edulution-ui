import React, { useEffect, useState } from 'react';
import { SurveyModel } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import useLanguage from '@/hooks/useLanguage';

const visuPanelOptions = {
  haveCommercialLicense: true,
  defaultChartType: 'bar',
  showToolbar: false,
  allowDynamicLayout: false,
  allowHideQuestions: false,
};

interface ResultVisualizationDialogBodyProps {
  formula?: TSurveyFormula;
  result?: JSON[];
}

const ResultVisualization = (props: ResultVisualizationDialogBodyProps) => {
  const { formula, result } = props;

  const { language } = useLanguage();

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuPanel, setVisuPanel] = useState<VisualizationPanel | null>(null);

  if (survey == null) {
    const surveyModel = new SurveyModel(formula);
    setSurvey(surveyModel);
  }

  if (visuPanel == null && survey != null) {
    const questions = survey.getAllQuestions() || [];
    const answers = result || [];
    const visualizationPanel = new VisualizationPanel(questions, answers, visuPanelOptions);
    visualizationPanel.locale = language;
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
    <div className="rounded bg-secondary">
      <div id="surveyVisuPanel" />
    </div>
  );
};

export default ResultVisualization;
