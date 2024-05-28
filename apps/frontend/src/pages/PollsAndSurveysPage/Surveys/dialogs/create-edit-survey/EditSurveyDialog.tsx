import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from "uuid";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import useEditSurveyDialogStore
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/EditSurveyDialogStore';
import EditSurveyFormData from "@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/edit-survey-form.ts";
import EditSurveyDialogBody
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/EditSurveyDialogBody';
import useUserStore from "@/store/userStore.ts";

const createSurveyName = () => {
  const currentDate = new Date();
  const id = uuidv4();
  return `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${id}`;
};

interface EditSurveyDialogProps {
  isOpenEditSurveyDialog: boolean;
  openEditSurveyDialog: () => void;
  closeEditSurveyDialog: () => void;
  survey?: Survey;
  trigger?: React.ReactNode;
}

const EditSurveyDialog = (props: EditSurveyDialogProps) => {
  const {
    trigger,
    survey,
    isOpenEditSurveyDialog,
    openEditSurveyDialog,
    closeEditSurveyDialog
  } = props;

  const {
    isSaving,
    commitSurvey,
    error,
  } = useEditSurveyDialogStore();

  const { user } = useUserStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (survey) {
      form.setValue('surveyname', survey.surveyname || createSurveyName());
      form.setValue('survey', survey.survey);
      form.setValue('participants', survey.participants);
      form.setValue('created', survey.created || new Date());
    }
  }, [survey]);

  const initialFormValues: EditSurveyFormData = {
    surveyname: survey?.surveyname || createSurveyName(),
    survey: survey?.survey || undefined,
    participants: survey?.participants || [],
    saveNo: undefined,
    created: survey?.created || new Date(),
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
  });

  const form = useForm<EditSurveyFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const {
      surveyname,
      survey,
      participants,
      saveNo,
      created
    } = form.getValues();

    if (!surveyname || !survey || !participants) {
      throw new Error('Invalid form data');
    }

    await commitSurvey(
      surveyname,
      survey,
      participants,
      saveNo,
      created,
    );
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isSaving) return <LoadingIndicator isOpen={isSaving} />;
    return (
      <>
        <EditSurveyDialogBody userName={user} form={form}/>
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </>
    );
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isSaving}
          size="lg"
          type="submit"
        >
          {t('save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenEditSurveyDialog}
      trigger={trigger}
      handleOpenChange={isOpenEditSurveyDialog ? closeEditSurveyDialog : openEditSurveyDialog}
      title={t('survey.editing')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="min-h-[75%] max-w-[85%]"
  />
  );
};

export default EditSurveyDialog;
