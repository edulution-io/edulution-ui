import React, { useState, useEffect } from 'react';
import i18next from 'i18next';
import { Model } from 'survey-core';
import { SurveyModel } from 'survey-core/typings/survey';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';

const vizPanelOptions = {
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

  const [survey, setSurvey] = useState<SurveyModel | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  if (!survey) {
    const surveyModel = new Model(formula);
    setSurvey(surveyModel);
  }

  if (!vizPanel && !!survey) {
    const visualizationPanel = new VisualizationPanel(survey.getAllQuestions(), result, vizPanelOptions);
    visualizationPanel.locale = i18next.language;
    visualizationPanel.showToolbar = false;
    setVizPanel(visualizationPanel);
  }

  useEffect(() => {
    vizPanel?.render('surveyVizPanel');

    const component = document.getElementById('surveyVizPanel');
    return () => {
      if (component) {
        component.innerHTML = '';
      }
    };
  }, [vizPanel]);

  return (
    <div className="max-h-[75vh] rounded bg-gray-600 p-4 text-white">
      <div id="surveyVizPanel" />
    </div>
  );
};

export default ResultVisualizationDialogBody;
