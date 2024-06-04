import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useEditorStore from '@/pages/Surveys/Subpages/Editor/EditorStore';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import { createSurveyName } from '@/pages/Surveys/Subpages/components/create-survey-name';
import PropagateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialog';

import Editor from '@/pages/Surveys/Subpages/Editor/Editor';
import EditorFormData from '@/pages/Surveys/Subpages/Editor/editor-form-data';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';

interface SurveyEditorProps {
  selectedSurvey?: Survey;
}

const SurveyEditor = (props: SurveyEditorProps) => {
  const { selectedSurvey } = props;
  const { commitSurvey, isSaving, error } = useEditorStore();
  const { openPropagateSurveyDialog, closePropagateSurveyDialog } = usePropagateSurveyDialogStore();

  const [editorSurveyText, setEditorSurveyText] = React.useState<string | undefined>(JSON.stringify(selectedSurvey?.survey));

  const { t } = useTranslation();

  const initialFormValues: EditorFormData = {
    surveyname: selectedSurvey?.surveyname || createSurveyName(),
    survey: selectedSurvey?.survey || undefined,
    participants: [],
    saveNo: selectedSurvey?.saveNo || 0,
    created: selectedSurvey?.created || new Date(),
    expires: selectedSurvey?.expires || undefined,
    isAnonymous: selectedSurvey?.isAnonymous || false,
    canSubmitMultipleAnswers: selectedSurvey?.canSubmitMultipleAnswers || false,
    invitedGroups: [],
  };

  const emptyFormValues: EditorFormData = {
    surveyname: createSurveyName(),
    survey: undefined,
    participants: [],
    saveNo: 0,
    created: new Date(),
    expires: undefined,
    isAnonymous: false,
    canSubmitMultipleAnswers: false,
    invitedGroups: [],
  }

  const formSchema = z.object({
    surveyname: z.string(),
    survey: z.string(),
    participants: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    saveNo: z.number().optional(),
    created: z.date().optional(),
    expires: z.date().optional(),
    isAnonymous: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),
    invitedGroups: z.array(z.object({})),
  });

  const form = useForm<EditorFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const resetSurvey = () => {
    form.reset(emptyFormValues);
    setEditorSurveyText('');
  }

  const saveSurvey = async () => {
    const {
      surveyname,
      survey,
      participants,
      saveNo,
      created,
      expires,
      isAnonymous,
      canSubmitMultipleAnswers
    } = form.getValues();

    try {
      const updatedSurvey = await commitSurvey(
        surveyname,
        survey,
        participants,
        saveNo,
        created,
        expires,
        isAnonymous,
        canSubmitMultipleAnswers,
      );
      setEditorSurveyText(JSON.stringify(updatedSurvey!.survey));
      closePropagateSurveyDialog();
    } catch (error) {
      setEditorSurveyText(survey!);
      console.error(error);
    }
  }

  if (isSaving) return <div>Loading...</div>;

  return (
    <>
      <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
        <ScrollArea className="overflow-y-auto overflow-x-hidden">
          <Editor
            form={form}
            survey={editorSurveyText} //selectedSurvey?.survey}
            saveNumber={selectedSurvey?.saveNo || 0}
            error={error}/>
          {error ? (
            <div className="rounded-xl bg-red-400 py-3 text-center text-black">
              {t('survey.error')}: {error.message}
            </div>
          ) : null}
        </ScrollArea>
      </div>

      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <FloatingActionButton
            icon={SurveyButtonProps.Save.icon}
            text={t(SurveyButtonProps.Save.title)}
            onClick={openPropagateSurveyDialog}
          />
          <FloatingActionButton
            icon={SurveyButtonProps.Abort.icon}
            text={t(SurveyButtonProps.Abort.title)}
            onClick={resetSurvey}
          />
        </div>
      </TooltipProvider>
      <PropagateSurveyDialog
        form={form}
        propagateSurvey={saveSurvey}
        isSaving={isSaving}
      />
    </>
  );
};

export default SurveyEditor;
