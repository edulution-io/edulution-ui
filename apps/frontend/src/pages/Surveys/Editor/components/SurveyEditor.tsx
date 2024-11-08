import React from 'react';
import i18next from 'i18next';
import { UseFormReturn } from 'react-hook-form';
import { editorLocalization, localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/english';
import 'survey-creator-core/i18n/german';
import 'survey-creator-core/i18n/french';
import 'survey-creator-core/i18n/spanish';
import 'survey-creator-core/i18n/italian';
import surveyTheme from '@/pages/Surveys/theme/theme';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/custom.survey.css';
import '@/pages/Surveys/theme/custom.creator.css';
import useElementHeight from '@/hooks/useElementHeight';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';

interface SurveyEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  saveNumber: number;
  formula?: JSON;
}

editorLocalization.defaultLocale = i18next.options.lng || 'en';
localization.currentLocale = i18next.options.lng || 'en';

const SurveyEditor = (props: SurveyEditorProps) => {
  const { form, saveNumber, formula } = props;

  const creatorOptions = {
    generateValidJSON: true,
    isAutoSave: true,
    maxNestedPanels: 0,
    showJSONEditorTab: true,
    showPreviewTab: true,
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

  creator.saveNo = saveNumber;
  if (formula) {
    creator.JSON = formula;
  }

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
    form.setValue('formula', creator.JSON);
  });

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    form.setValue('formula', creator.JSON);
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  };

  const pageBarsHeight = useElementHeight([FLOATING_BUTTONS_BAR_ID, FOOTER_ID]) + 10;

  return (
    <div
      className="survey-editor w-full overflow-y-auto overflow-x-hidden scrollbar-thin md:w-auto md:max-w-7xl xl:max-w-full"
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
