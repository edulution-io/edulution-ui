/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { SurveyModel } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import '../dialogs/resultTableDialog.css';
import useLanguage from '@/hooks/useLanguage';

interface ResultTableDialogBodyProps {
  formula: TSurveyFormula;
  result: JSON[];
}

const ResultTable = (props: ResultTableDialogBodyProps) => {
  const { formula, result } = props;

  const { language } = useLanguage();

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [visuTable, setVisuTable] = useState<Tabulator | null>(null);

  if (survey == null) {
    const surveyModel = new SurveyModel(formula);
    setSurvey(surveyModel);
  }

  if (visuTable == null && survey != null) {
    const answers = result || [];
    const surveyVisuTable = new Tabulator(survey, answers);
    surveyVisuTable.locale = language;
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
    <div className="max-h-[75vh] rounded bg-secondary px-4 pb-4 text-background">
      <div id="surveyDashboardContainer" />
    </div>
  );
};

export default ResultTable;
