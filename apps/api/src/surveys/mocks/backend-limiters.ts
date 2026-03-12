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

import { Types } from 'mongoose';
import SurveyQuestionPanelTypes from '@libs/survey/constants/surveyQuestionPanelTypes';
import SurveyQuestionOtherTypes from '@libs/survey/constants/surveyQuestionOtherTypes';
import SurveyQuestionChoiceTypes from '@libs/survey/constants/surveyQuestionChoiceTypes';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import { Survey } from '../survey.schema';

export const mockSurveyId: string = new Types.ObjectId().toString();
export const mockQuestionName: string = 'testQuestion';

const existingChoiceName: string = 'existingChoice';
const existingChoiceTitle: string = 'Existing';
const existingChoiceLimit: number = 3;
const existingChoice: ChoiceDto = { name: existingChoiceName, title: existingChoiceTitle, limit: existingChoiceLimit };

export const newChoiceName: string = 'newChoice';
export const newChoiceTitle: string = 'New Choice';
const newChoice: ChoiceDto = { name: newChoiceName, title: newChoiceTitle, limit: 0 };

export const showOtherItemChoiceLimit: number = 10;
const showOtherItemChoice: ChoiceDto = { name: SHOW_OTHER_ITEM, title: SHOW_OTHER_ITEM, limit: 10 };

export const targetQuestionName: string = 'targetQuestion';
export const targetQuestion: TSurveyElement = {
  type: SurveyQuestionOtherTypes.TEXT,
  name: targetQuestionName,
  value: undefined,
};

const otherQuestionName: string = 'other';
export const otherQuestion: TSurveyElement = {
  type: SurveyQuestionOtherTypes.TEXT,
  name: otherQuestionName,
  value: undefined,
};

export const dropdownQuestionWithShowOtherItemName: string = 'dropdownQuestionWithShowOtherItem';
export const dropdownQuestionWithShowOtherItem: TSurveyElement = {
  type: SurveyQuestionChoiceTypes.CHECKBOX,
  name: dropdownQuestionWithShowOtherItemName,
  value: undefined,
  showOtherItem: true,
};

export const dropdownQuestionWithoutShowOtherItemName: string = 'dropdownQuestionWithoutShowOtherItem';
export const dropdownQuestionWithoutShowOtherItem: TSurveyElement = {
  type: SurveyQuestionChoiceTypes.CHECKBOX,
  name: dropdownQuestionWithoutShowOtherItemName,
  value: undefined,
};

export const topLevelElements: TSurveyElement[] = [otherQuestion, targetQuestion];

export const panelName: string = 'panel1';
export const panelElements: TSurveyElement[] = [
  {
    type: SurveyQuestionPanelTypes.PANEL,
    name: panelName,
    value: undefined,
    elements: [targetQuestion],
  },
];

export const dynamicPanelName: string = 'dynamicPanel1';
export const dynamicPanelElements: TSurveyElement[] = [
  {
    type: SurveyQuestionPanelTypes.DYNAMIC_PANEL,
    name: dynamicPanelName,
    value: undefined,
    templateElements: [targetQuestion],
  },
];

export const formulaName: string = 'formula1';
export const flatFormula: SurveyFormula = {
  title: formulaName,
  elements: [targetQuestion],
};

export const pageName: string = 'page1';
export const pagedFormula: SurveyFormula = {
  title: formulaName,
  pages: [{ name: pageName, elements: [targetQuestion] }],
};

export const surveyWithShowOtherItem: Survey = {
  formula: {
    title: formulaName,
    elements: [dropdownQuestionWithShowOtherItem],
  },
} as unknown as Survey;

export const surveyWithoutShowOtherItem: Survey = {
  formula: {
    title: formulaName,
    elements: [dropdownQuestionWithoutShowOtherItem],
  },
} as unknown as Survey;

export const surveyWithEmptyElements: Survey = {
  formula: { title: formulaName, elements: [] },
} as unknown as Survey;

export const mockChoices: ChoiceDto[] = [existingChoice];

export const existingChoicesWithShowOtherItem: ChoiceDto[] = [existingChoice, showOtherItemChoice];

export const existingChoicesWithoutShowOtherItem: ChoiceDto[] = [existingChoice];

export const newChoices: ChoiceDto[] = [newChoice];

export const duplicateChoices: ChoiceDto[] = [existingChoice];
