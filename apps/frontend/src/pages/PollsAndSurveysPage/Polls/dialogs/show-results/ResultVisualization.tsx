'use client';

import { useState } from 'react';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';

interface VisualisationPanelProps {
  formula: string;
  answers: JSON[];
}

const ResultVisualisation = (props: VisualisationPanelProps) => {
  const { formula, answers } = props;

  const [survey, setSurvey] = useState<Model | null>(null);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | null>(null);
  if (!survey) {
    const survey = new Model(formula);
    setSurvey(survey);
  }

  const vizPanelOptions = {
    allowHideQuestions: false
  }
  if (!vizPanel && !!survey) {
    const newVizPanel = new VisualizationPanel(
      survey.getAllQuestions(),
      answers,
      vizPanelOptions
    );
    newVizPanel.showToolbar = false;
    setVizPanel(newVizPanel);
  }

  if(!vizPanel) {
    throw new Error("vizPanel is not defined");
  }

  return (
    <div id="surveyVizPanel" />
  );
}

export default ResultVisualisation;
