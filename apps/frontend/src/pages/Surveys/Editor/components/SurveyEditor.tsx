import React from 'react';
import i18next from 'i18next';
import { UseFormReturn } from 'react-hook-form';
import { editorLocalization, localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-core/survey.i18n';
import 'survey-creator-core/i18n/german';
import 'survey-creator-core/survey-creator-core.i18n';
import '@/pages/Surveys/theme/default2.min.css';
import '@/pages/Surveys/theme/creator.min.css';

interface SurveyEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  saveNumber: number;
  formula?: JSON;
  error: Error | null;
}

editorLocalization.defaultLocale = 'de';
localization.currentLocale = i18next.language;

const SurveyEditor = (props: SurveyEditorProps) => {
  const { form, saveNumber, formula, error } = props;

  const creatorOptions = {
    generateValidJSON: true,
    showJSONEditorTab: true,
    showPreviewTab: false,
    isAutoSave: true,
    maxNestedPanels: 0,
  };
  const creator = new SurveyCreator(creatorOptions);

  creator.locale = editorLocalization.defaultLocale;

  creator.saveNo = saveNumber;
  if (formula) {
    creator.JSON = formula;
  }

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
      {error ? (
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">Survey-Error: {error.message}</div>
      ) : null}
    </>
  );
};

export default SurveyEditor;
