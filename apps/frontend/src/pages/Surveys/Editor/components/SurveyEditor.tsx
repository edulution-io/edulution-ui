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
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';

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
    showPreviewTab: false,
    showLogicTab: true,
    questionTypes: [
      'radiogroup',
      'rating',
      'checkbox',
      'dropdown',
      'tagbox',
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
      // 'image',
      // 'signaturepad',
    ],
  };
  const creator = new SurveyCreator(creatorOptions);

  creator.saveNo = saveNumber;
  if (formula) {
    creator.JSON = formula;
  }

  // TOOLBAR (HEADER)
  const settingsAction = creator.toolbar.actions.findIndex((action) => action.id === 'svd-settings');
  creator.toolbar.actions.splice(settingsAction, 1);

  const expandSettingsAction = creator.toolbar.actions.findIndex((action) => action.id === 'svd-grid-expand');
  creator.toolbar.actions.splice(expandSettingsAction, 1);

  // TOOLBOX (LEFT SIDEBAR)
  creator.showToolbox = true; // TODO: Ask
  creator.toolbox.overflowBehavior = 'scroll';
  creator.toolbox.searchEnabled = false;

  // PROPERTY GRID (RIGHT SIDEBAR)
  creator.showSidebar = false;
  // TODO: NIEDUUI-334: add a placeholder to for the description of the question (invisible - accessible in sidebar)

  // ELEMENT MENU (part of the ELEMENT/QUESTION)
  creator.onDefineElementMenuItems.add((_, options) => {
    const settingsItemIndex = options.items.findIndex((option) => option.iconName === 'icon-settings_16x16');
    options.items.splice(settingsItemIndex, 1);
  });

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    form.setValue('formula', creator.JSON);
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  };

  creator.onModified.add(() => {
    form.setValue('formula', creator.JSON);
  });

  return (
    <SurveyCreatorComponent
      creator={creator}
      style={{
        height: '85vh',
        width: '100%',
      }}
    />
  );
};

export default SurveyEditor;
