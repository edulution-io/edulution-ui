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

import React, { FC, useEffect, useRef } from 'react';
import { SurveyModel } from 'survey-core';
import { Tabulator } from 'survey-analytics/survey.analytics.tabulator';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'survey-analytics/survey.analytics.tabulator.css';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import useLanguage from '@/hooks/useLanguage';
import '../dialogs/resultTableDialog.css';

interface ResultTableDialogBodyProps {
  formula: TSurveyFormula;
  result: JSON[];
}

const ResultTable: FC<ResultTableDialogBodyProps> = ({ formula, result }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const surveyModel = new SurveyModel(formula);
    const surveyTable = new Tabulator(surveyModel, result || []);
    surveyTable.locale = language;

    if (containerRef.current) {
      surveyTable.render(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [formula, result, language]);

  return <div ref={containerRef} />;
};

export default ResultTable;
