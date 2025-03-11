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

import { settings } from 'survey-core';
import { editorLocalization, localization } from 'survey-creator-core';
import { SurveyCreator } from 'survey-creator-react';
import 'survey-creator-core/i18n/english';
import 'survey-creator-core/i18n/german';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/custom.survey.css';
import '@/pages/Surveys/theme/custom.creator.css';

settings.lazyRender.enabled = true;

const createSurveyCreatorComponent = (language = 'en') => {
  editorLocalization.defaultLocale = language;
  localization.currentLocale = language;

  const creatorOptions = {
    generateValidJSON: true,
    isAutoSave: false,
    maxNestedPanels: 0,
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
    ],
  };

  const creator = new SurveyCreator(creatorOptions);

  creator.theme = surveyTheme;
  creator.locale = language;

  creator.showToolbox = false;
  creator.showSidebar = false;
  creator.startEditTitleOnQuestionAdded = true;

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
    options.allowShowSettings = false;
  });

  creator.onDefineElementMenuItems.add((_, options) => {
    const settingsItemIndex = options.items.findIndex((option) => option.iconName === 'icon-settings_16x16');
    if (settingsItemIndex >= 0) {
      options.items.splice(settingsItemIndex, 1);
    }
  });

  return creator;
};

export default createSurveyCreatorComponent;
