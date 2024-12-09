import React, { useEffect, useState } from 'react';
import { SurveyModel } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import useUserStore from '@/store/UserStore/UserStore';
import '../dialogs/resultTableDialog.css';

interface ResultTableDialogBodyProps {
  formula: TSurveyFormula;
  result: JSON[];
}

const ResultTable = (props: ResultTableDialogBodyProps) => {
  const { formula, result } = props;

  const { user } = useUserStore();

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuTable, setVisuTable] = useState<Tabulator | null>(null);

  if (survey == null) {
    const surveyModel = new SurveyModel(formula);
    setSurvey(surveyModel);
  }

  if (visuTable == null && survey != null) {
    const answers = result || [];
    const surveyVisuTable = new Tabulator(survey, answers);
    surveyVisuTable.locale = user?.language ?? 'de';
    setVisuTable(surveyVisuTable);
  }

  useEffect(() => {
    visuTable?.render('surveyDashboardContainer');

    const component = document.getElementById('surveyDashboardContainer');
    return () => {
      if (component) {
        component.innerHTML = '';
      }
    };
  }, [visuTable]);

  return (
    <div className="max-h-[75vh] rounded bg-ciLightGrey px-4 pb-4 text-foreground">
      <div id="surveyDashboardContainer" />
    </div>
  );
};

export default ResultTable;
