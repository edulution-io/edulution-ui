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
import { surveyLocalization } from 'survey-core';
import { editorLocalization, SurveyCreator } from 'survey-creator-react';
import 'survey-core/i18n/english';
import 'survey-core/i18n/german';
import 'survey-core/i18n/french';
import 'survey-creator-core/i18n/english';
import 'survey-creator-core/i18n/german';
import 'survey-creator-core/i18n/french';
import surveyTheme from '@/pages/Surveys/theme/surveyTheme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/custom.survey.css';
import '@/pages/Surveys/theme/custom.creator.css';

const createSurveyCreatorObject = (language = 'en') => {
  surveyLocalization.supportedLocales = ['en', 'de', 'fr'];
  surveyLocalization.defaultLocale = language;
  surveyLocalization.currentLocale = language;
  editorLocalization.defaultLocale = language;
  editorLocalization.currentLocale = language;

  const creatorOptions = {
    generateValidJSON: true,
    isAutoSave: true,
    showJSONEditorTab: true,
    showPreviewTab: false,
    showLogicTab: true,
    questionTypes: [
      'radiogroup',
      'rating',
      'checkbox',
      'dropdown',
      'boolean',
      'file',
      'imagepicker',
      'ranking',
      'text',
      'comment',
      'multipletext',
      'panel',
      'paneldynamic',
      'matrix',
      'matrixdropdown',
      'image',
      'signaturepad',
    ],
    forbiddenNestedElements: {
      panel: ['panel', 'paneldynamic'],
      paneldynamic: ['panel', 'paneldynamic', 'file'],
    },
    maxNestedPanels: 1,
  };

  const creator = new SurveyCreator(creatorOptions);

  creator.theme = surveyTheme;
  creator.locale = language;

  creator.showToolbox = false;
  creator.showSidebar = false;
  creator.startEditTitleOnQuestionAdded = true;

  creator.toolbox.getItemByName('text').title = t('survey.editor.inputFieldTitle');

  const settingsActionHeader = creator.toolbar.actions.findIndex((action) => action.id === 'svd-settings');
  if (settingsActionHeader >= 0) creator.toolbar.actions.splice(settingsActionHeader, 1);
  const expandGridActionHeader = creator.toolbar.actions.findIndex((action) => action.id === 'svd-grid-expand');
  if (expandGridActionHeader >= 0) creator.toolbar.actions.splice(expandGridActionHeader, 1);
  const designerActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-designer');
  if (designerActionFooter >= 0) creator.footerToolbar.actions.splice(designerActionFooter, 1);
  const previewActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-preview');
  if (previewActionFooter >= 0) creator.footerToolbar.actions.splice(previewActionFooter, 1);
  const settingsActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-settings');
  if (settingsActionFooter >= 0) creator.footerToolbar.actions.splice(settingsActionFooter, 1);

  creator.onElementAllowOperations.add((_, options) => {
    // eslint-disable-next-line no-param-reassign
    options.allowShowSettings = true;
  });

  return creator;
};

export default createSurveyCreatorObject;
