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

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import ResultTable from '@/pages/Surveys/Tables/components/ResultTable';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import './resultTableDialog.css';

const ResultTableDialogBody = () => {
  const { selectedSurvey } = useSurveyTablesPageStore();
  const { setIsOpenPublicResultsTableDialog, getSurveyResult, result } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (selectedSurvey?.id) {
      void getSurveyResult(selectedSurvey.id);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (!selectedSurvey?.formula) {
      toast.error(t(SurveyErrorMessages.NoFormula));
      setIsOpenPublicResultsTableDialog(false);
    } else if (result && result.length === 0) {
      setIsOpenPublicResultsTableDialog(false);
    }
  }, [selectedSurvey, result]);

  if (!selectedSurvey?.formula || !result || result.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="survey-result-table overflow-x-auto overflow-y-auto">
      <ResultTable
        formula={selectedSurvey.formula}
        result={result}
      />
    </ScrollArea>
  );
};

export default ResultTableDialogBody;
