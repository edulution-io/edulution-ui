'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from 'survey-core';

import { VisualizationPanel /* , VisualizationManager */ } from 'survey-analytics';
// import { WordCloud } from 'survey-analytics/survey-analytics.types/wordcloud/wordcloud';

import 'survey-analytics/survey.analytics.min.css';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/creator.min.css';
import '@/pages/PollsAndSurveysPage/Surveys/components/theme/default2.min.css';

import { PollChoices } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';

// VisualizationManager.unregisterVisualizer("text", WordCloud);

interface PollSubmissionsProps {
  pollFormula: string;
  choices: PollChoices[];
}

const PollVisualization = (props: PollSubmissionsProps) => {
  const { pollFormula, choices } = props;

  const { t } = useTranslation();

  const [survey, setSurvey] = useState<Model | undefined>(undefined);
  const [vizPanel, setVizPanel] = useState<VisualizationPanel | undefined>(undefined);

  useEffect(() => {
    setSurvey(new Model(pollFormula));
  }, [pollFormula]);

  useEffect(() => {
    setVizPanel(
      survey
        ? new VisualizationPanel(
            survey.getAllQuestions(),
            choices.map((choice) => JSON.parse(choice.choice)),
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
  }, [survey, choices]);

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

  if (!choices) {
    return <div className="p-4 text-center">{t('poll.noAnswerWasSubmitted')}</div>;
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

export default PollVisualization;
