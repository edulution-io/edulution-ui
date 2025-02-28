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

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { editorLocalization, localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/english';
import 'survey-creator-core/i18n/german';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import getSurveyFormulaFromJSON from '@libs/survey/utils/getSurveyFormulaFromJSON';
import useLanguage from '@/hooks/useLanguage';
import useElementHeight from '@/hooks/useElementHeight';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/custom.survey.css';
import '@/pages/Surveys/theme/custom.creator.css';

interface SurveyEditorProps {
  form: UseFormReturn<SurveyDto>;
}

const SurveyEditor = (props: SurveyEditorProps) => {
  const { form } = props;

  const { language } = useLanguage();

  editorLocalization.defaultLocale = language;
  localization.currentLocale = language;

  const creatorOptions = {
    generateValidJSON: true,
    isAutoSave: true,
    maxNestedPanels: 0,
    showJSONEditorTab: true,
    showPreviewTab: false,
    showLogicTab: true,
    questionTypes: [
      'radiogroup',
      'rating',
      'checkbox',
      'dropdown',
      // 'tagbox',
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
      'matrixdynamic',
      'image',
      // 'html',
      // 'expression',
      // 'signaturepad',
    ],
  };
  const creator = new SurveyCreator(creatorOptions);

  creator.theme = surveyTheme;

  creator.saveNo = form.getValues('saveNo');
  creator.JSON = form.getValues('formula');

  // TOOLBAR (HEADER)
  const settingsActionHeader = creator.toolbar.actions.findIndex((action) => action.id === 'svd-settings');
  creator.toolbar.actions.splice(settingsActionHeader, 1);

  const expandGridActionHeader = creator.toolbar.actions.findIndex((action) => action.id === 'svd-grid-expand');
  creator.toolbar.actions.splice(expandGridActionHeader, 1);

  // TOOLBAR (FOOTER)
  const designerActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-designer');
  creator.footerToolbar.actions.splice(designerActionFooter, 1);

  const previewActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-preview');
  creator.footerToolbar.actions.splice(previewActionFooter, 1);

  const settingsActionFooter = creator.footerToolbar.actions.findIndex((action) => action.id === 'svd-settings');
  creator.footerToolbar.actions.splice(settingsActionFooter, 1);

  // TOOLBOX (LEFT SIDEBAR)
  creator.showToolbox = false;

  // PROPERTY GRID (RIGHT SIDEBAR)
  creator.showSidebar = false;

  creator.startEditTitleOnQuestionAdded = true;

  creator.onElementAllowOperations.add((_, options) => {
    // eslint-disable-next-line no-param-reassign
    options.allowShowSettings = false;
  });

  // ELEMENT MENU (part of the ELEMENT/QUESTION)
  creator.onDefineElementMenuItems.add((_, options) => {
    const settingsItemIndex = options.items.findIndex((option) => option.iconName === 'icon-settings_16x16');
    options.items.splice(settingsItemIndex, 1);
  });

  creator.onModified.add(() => {
    form.setValue('formula', getSurveyFormulaFromJSON(creator.JSON as JSON));
  });

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    form.setValue('formula', getSurveyFormulaFromJSON(creator.JSON as JSON));
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  };

  const pageBarsHeight = useElementHeight([FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 10;

  return (
    <div
      className="survey-editor"
      style={{ height: `calc(100% - ${pageBarsHeight}px)` }}
    >
      <SurveyCreatorComponent
        creator={creator}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  );
};

export default SurveyEditor;
