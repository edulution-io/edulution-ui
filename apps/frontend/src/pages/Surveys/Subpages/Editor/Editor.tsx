import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { localization } from 'survey-creator-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import 'survey-creator-core/i18n/german';
import '@/pages/Surveys/Subpages/components/theme/default2.min.css';
import '@/pages/Surveys/Subpages/components/theme/creator.min.css';

interface EditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  saveNumber: number;
  survey?: string;
  error: Error | null;
}

const Editor = (props: EditorProps) => {
  const {
    form,
    saveNumber,
    survey,
    error,
  } = props;

  const creatorOptions = {
    isAutoSave: true,

    showPreviewTab: false,
    showJSONEditorTab: false,
    maxNestedPanels: 0,
  };

  const { t } = useTranslation();

  const creator = new SurveyCreator(creatorOptions);

  creator.saveNo = saveNumber;
  if(survey) {
    creator.text = survey;
  }

  creator.saveSurveyFunc = (saveNo: number, callback: (saveNo: number, isSuccess: boolean) => void) => {
    form.setValue('survey', JSON.stringify(creator.JSON));
    form.setValue('saveNo', saveNo);
    callback(saveNo, true);
  }

  localization.currentLocale = 'de';
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
        <div className="rounded-xl bg-red-400 py-3 text-center text-black">
          {t('conferences.error')}: {error.message}
        </div>
      ) : null}
    </>
  );
};

export default Editor;
