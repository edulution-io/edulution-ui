import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
// import useUserStore from '@/store/userStore';

import { TooltipProvider } from '@/components/ui/Tooltip.tsx';
import FloatingActionButton from '@/components/ui/FloatingActionButton.tsx';
import useEditorStore from '@/pages/Surveys/Subpages/Editor/EditorStore.tsx';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore.ts';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import { createSurveyName } from '@/pages/Surveys/Subpages/components/create-survey-name';

import { ScrollArea } from '@/components/ui/ScrollArea.tsx';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog.tsx';
import PropagateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialog.tsx';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog.tsx';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResults/ShowSurveyResultsDialog.tsx';

import Editor from '@/pages/Surveys/Subpages/Editor/Editor';
import EditorFormData from '@/pages/Surveys/Subpages/Editor/editor-form-data';
import { PageView } from "@/pages/Surveys/Subpages/components/types/page-view.ts";
import SurveyButtonProps from "@/pages/Surveys/Subpages/components/survey-button-props.ts";

const SurveyEditor = () => {
  // const { user } = useUserStore();
  const {
    selectedPageView,
    selectedSurvey,
    updateOpenSurveys,
    updateAnsweredSurveys,
  } = useSurveysPageStore();
  const { commitSurvey, isSaving, error } = useEditorStore();
  const { openPropagateSurveyDialog } = usePropagateSurveyDialogStore();

  const { t } = useTranslation();

  const initialFormValues: EditorFormData = {
    surveyname: selectedSurvey?.surveyname || createSurveyName(),
    survey: selectedSurvey?.survey || undefined,
    participants: selectedSurvey?.participants || [],
    saveNo: selectedSurvey?.saveNo || 0,
    created: selectedSurvey?.created || new Date(),
    expires: selectedSurvey?.expires || undefined,
    isAnonymous: selectedSurvey?.isAnonymous || false,
    canSubmitMultipleAnswers: selectedSurvey?.canSubmitMultipleAnswers || false,
  };

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
  });

  const form = useForm<EditorFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const createNew = () => {
    form.setValue('surveyname', createSurveyName());
    form.setValue('survey', undefined);
    form.setValue('participants', []);
    form.setValue('saveNo', 0);
    form.setValue('created', new Date());
    form.setValue('expires', undefined);
    form.setValue('isAnonymous', false);
    form.setValue('canSubmitMultipleAnswers', false);
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

    form.setValue('surveyname', updatedSurvey?.surveyname || surveyname);
    form.setValue('survey', updatedSurvey?.survey || survey);
    form.setValue('participants', updatedSurvey?.participants || participants);
    form.setValue('saveNo', updatedSurvey?.saveNo || saveNo);
    form.setValue('created',updatedSurvey?.created || created);
    form.setValue('expires', updatedSurvey?.expires || expires);
    form.setValue('isAnonymous', updatedSurvey?.isAnonymous || isAnonymous);
    form.setValue('canSubmitMultipleAnswers', updatedSurvey?.canSubmitMultipleAnswers || canSubmitMultipleAnswers);
  }

  if (isSaving) return <div>Loading...</div>;

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <Editor form={form} survey={selectedSurvey?.survey} saveNumber={selectedSurvey?.saveNo || 0} error={error}/>
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </ScrollArea>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <FloatingActionButton
            icon={SurveyButtonProps.Save.icon}
            text={t(SurveyButtonProps.Save.title)}
            onClick={saveSurvey}
          />
          {
            selectedPageView === PageView.SURVEY_EDITOR ? (
              <>
                <FloatingActionButton
                  icon={SurveyButtonProps.Options.icon}
                  text={t(SurveyButtonProps.Options.title)}
                  onClick={openPropagateSurveyDialog}
                />
              </>
            ) : null
          }
          {
            selectedPageView === PageView.SURVEY_CREATOR ? (
              <>
                <FloatingActionButton
                  icon={SurveyButtonProps.Propagate.icon}
                  text={t(SurveyButtonProps.Propagate.title)}
                  onClick={openPropagateSurveyDialog}
                />
              </>
            ) : null
          }
          <FloatingActionButton
            icon={SurveyButtonProps.New.icon}
            text={t(SurveyButtonProps.New.title)}
            onClick={createNew}
          />
        </div>
      </TooltipProvider>
      <ParticipateSurveyDialog
        survey={selectedSurvey!}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
      />
      <PropagateSurveyDialog survey={selectedSurvey!} />
      <ShowSurveyAnswerDialog survey={selectedSurvey!} />
      <ShowSurveyResultsDialog survey={selectedSurvey!} />
    </>
  );
};

export default SurveyEditor;
