'use client';

import React, { useEffect, useState } from 'react';
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

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  if (!survey) {
    const survey = new Model(JSON.parse(JSON.stringify(surveyFormula)));
    survey.data = answers.map((answer) => answer.answer);
    setSurvey(survey);
  }

  if (!vizPanel && !!survey) {
    const surveyQuestions = survey?.getAllQuestions();
    const surveyVizPanelOptions = {
      haveCommercialLicense: true,
      defaultChartType: 'bar',
      showToolbar: false,
    };
    const surveyVizPanel = new VisualizationPanel(surveyQuestions, answers, surveyVizPanelOptions);
    setVizPanel(surveyVizPanel);
  }

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
    <div id="surveyVizPanel" />
  );
};

export default SurveyVisualization;

/*
  useEffect(() => {
    try {
      // const surveyModel = new Model(JSON.parse(JSON.stringify(surveyFormula)));
      const surveyModel = new Model(JSON.stringify(surveyFormula));
      setSurvey(surveyModel);
    } catch (error) {
      setSurvey(undefined);
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
        showToolbar: false,
      };
      const surveyVizPanel = new VisualizationPanel(surveyQuestions, answers, surveyVizPanelOptions);
      surveyVizPanel.showToolbar = false;
      setVizPanel(surveyVizPanel);
    } catch (error) {
      setVizPanel(undefined);
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

  if(!survey || !vizPanel) {
    return null;
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

*/
