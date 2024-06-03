'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import { SurveyAnswer } from '@/pages/Surveys/Subpages/components/types/survey-answer';
import 'survey-analytics/survey.analytics.min.css';
import '@/pages/Surveys/Subpages/components/theme/creator.min.css';
import '@/pages/Surveys/Subpages/components/theme/default2.min.css';

interface SurveyVisualizationProps {
  surveyFormula: string;
  answers: SurveyAnswer[]; //JSON[]
}

const SurveyVisualization = (props: SurveyVisualizationProps) => {
  const { surveyFormula, answers } = props;

  const { t } = useTranslation();

  const [survey, setSurvey] = useState<Model | null>(null);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | null>(null);

  useEffect(() => {
    try {
      // const surveyModel = new Model(JSON.parse(JSON.stringify(surveyFormula)));
      const surveyModel = new Model(JSON.stringify(surveyFormula));
      setSurvey(surveyModel);
    } catch (error) {
      setSurvey(null);
      console.error(error);
    }
  }, [surveyFormula]);

  useEffect(() => {
    if (!survey) {
      return;
    }

    try {
      const surveyQuestions = survey?.getAllQuestions();
      const surveyVizPanelOptions = {
        // allowHideQuestions: true,
        // allowDynamicLayout: false,
        // allowHideEmptyAnswers: true,
        // answersOrder: 'asc' as "default" | "asc" | "desc" | undefined,
        haveCommercialLicense: true,
        defaultChartType: 'bar',
      };
      const surveyVizPanel = new VisualizationPanel(surveyQuestions, answers, surveyVizPanelOptions);
      surveyVizPanel.showToolbar = false;
      setVizPanel(surveyVizPanel);
    } catch (error) {
      setVizPanel(null);
      console.error(error);
    }
  }, [survey, answers]);

  useEffect(() => {
    if (!vizPanel) {
      return;
    }

    vizPanel?.render('surveyVizPanel');
    const component = document.getElementById('surveyVizPanel');
    if (component) {
      return () => {
        component.innerHTML = '';
      };
    }
    return;
  }, [vizPanel]);

  if (!answers) {
    return <div className="p-4 text-center">{t('survey.noAnswerWasSubmitted')}</div>;
  }
  if (!survey) {
    return <div className="p-4 text-center">Survey model is not defined</div>;
  }
  if (!vizPanel) {
    return <div className="p-4 text-center">Visualization panel is not defined</div>;
  }

  return (
    <div
      className="p-4 text-center"
    >
      <div id="surveyVizPanel"/>
    </div>
  );
};

export default SurveyVisualization;
