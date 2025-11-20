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

import { t } from 'i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import { toast } from 'sonner';
import isSurveyPage from '@libs/survey/utils/isSurveyPage';
import isSurveyElement from '@libs/survey/utils/isSurveyElement';

const isValidSurveyFormula = (surveyFormula: SurveyFormula): boolean => {
  const { title, pages, elements } = surveyFormula;
  if (pages) {
    return pages.every(isSurveyPage);
  }
  if (elements) {
    return elements.every(isSurveyElement);
  }
  return !!title;
};

const getSurveyFormulaFromJSON = (formula: JSON): SurveyFormula => {
  try {
    const typedFormula = formula as unknown as SurveyFormula;

    const isValidFormula = isValidSurveyFormula(typedFormula);
    if (isValidFormula) {
      return typedFormula;
    }
  } catch (error) {
    toast.error(t(SurveyErrorMessages.SurveyFormulaStructuralError));
  }

  return { title: t('survey.newTitle').toString() };
};

export default getSurveyFormulaFromJSON;
