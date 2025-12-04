/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import getSurveyFormulaWithIdentificationPlaceholderQuestion from '@libs/survey/utils/getSurveyFormulaWithIdentificationPlaceholderQuestion';
import ResultVisualization from '@/pages/Surveys/Tables/components/ResultVisualization';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';

const ResultVisualizationDialogBody = () => {
  const { selectedSurvey } = useSurveysTablesPageStore();
  const { setIsOpenPublicResultsVisualisationDialog, getSurveyResult, result } = useResultDialogStore();

  const { t } = useTranslation();

  useEffect((): void => {
    if (selectedSurvey?.id) {
      void getSurveyResult(selectedSurvey.id);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (!selectedSurvey?.formula) {
      toast.error(t(SurveyErrorMessages.NoFormula));
      setIsOpenPublicResultsVisualisationDialog(false);
    } else if (result && result.length === 0) {
      setIsOpenPublicResultsVisualisationDialog(false);
    }
  }, [selectedSurvey, result]);

  if (!selectedSurvey?.formula || !result || result.length === 0) {
    return null;
  }

  let formula: SurveyFormula;
  if (!selectedSurvey?.isAnonymous) {
    formula = getSurveyFormulaWithIdentificationPlaceholderQuestion(selectedSurvey.formula);
  } else {
    formula = selectedSurvey.formula;
  }

  return (
    <ResultVisualization
      formula={formula}
      result={result}
    />
  );
};

export default ResultVisualizationDialogBody;
