'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from 'survey-core';
import { VisualizationPanel } from 'survey-analytics';
import 'survey-analytics/survey.analytics.min.css';
import '@/pages/Surveys/components/theme/creator.min.css';
import '@/pages/Surveys/components/theme/default2.min.css';


interface SurveyVisualizationProps {
  surveyFormula: string;
  answers: JSON[];
}

const SurveyVisualization = (props: SurveyVisualizationProps) => {
  const { surveyFormula, answers } = props;

  const { t } = useTranslation();

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  useEffect(() => {
    setSurvey(new Model(surveyFormula));
  }, [surveyFormula]);

  useEffect(() => {
    try {

      setVizPanel(
        survey && answers
          ? new VisualizationPanel(
            survey.getAllQuestions(),
            answers,
            {
              allowHideQuestions: true,
              allowDynamicLayout: false,
              // useValuesAsLabels: true,
              allowHideEmptyAnswers: true,
              answersOrder: 'asc',
              // layoutEngine: "column",
              haveCommercialLicense: true,
              defaultChartType: 'bar',
            },
          )
          : undefined,
      );

    } catch (error) {
      console.error(error);
    }
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
      id="surveyVizPanel"
    />
  );
};

export default SurveyVisualization;
