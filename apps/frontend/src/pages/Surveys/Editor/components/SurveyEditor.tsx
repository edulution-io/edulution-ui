import React from 'react';
import i18next from 'i18next';
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
// import { useTranslation } from 'react-i18next';
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
  error: Error | null;
}

editorLocalization.defaultLocale = i18next.language || 'en';
localization.currentLocale = i18next.language || 'en';

const SurveyEditor = (props: SurveyEditorProps) => {
  const { form, saveNumber, formula, error } = props;

  // const { t } = useTranslation();

  const creatorOptions = {
    generateValidJSON: true,
    isAutoSave: true,
    maxNestedPanels: 0,
    showJSONEditorTab: true,
    showPreviewTab: false,
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
  creator.showToolbox = true; // TODO: Ask Mi and Mo
  creator.toolbox.overflowBehavior = 'hideInMenu';
  creator.toolbox.searchEnabled = false;

  // PROPERTY GRID (RIGHT SIDEBAR)
  creator.showSidebar = false;
  creator.showPropertyGrid = false;

  // ADD PLACEHOLDER TEXT TO TEXT QUESTIONS
  // creator.onQuestionAdded.add((_, options) => {
  //   const updateOptions = options;
  //   if (updateOptions.question.getType() === 'text') {
  //     updateOptions.question.placeHolder = `${t('survey.editor.expectingUserInput')}`;
  //     // updateOptions.question.defaultValue = `${t('survey.editor.expectingUserInput')}`;
  //     // TODO: FIX PROBLEM: DOES NOT SHOW QUESTION DESCRIPTION ONLY IN THIS SETTINGS MENU
  //     // updateOptions.question.description = options.question.description || t('survey.editor.addDescription');
  //   }
  //   return updateOptions;
  // });

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    form.setValue('formula', creator.JSON);
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  };

  return (
    <>
      <SurveyCreatorComponent
        creator={creator}
        style={{
          height: '85vh',
          width: '100%',
        }}
      />
      {error ? toast.error(error.message) : null}
    </>
  );
};

export default SurveyEditor;
