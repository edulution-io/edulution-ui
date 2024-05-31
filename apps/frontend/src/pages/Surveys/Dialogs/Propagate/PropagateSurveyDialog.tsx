import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import {Button} from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {Survey} from '@/pages/Surveys/components/types/survey';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Dialogs/Propagate/PropagateSurveyDialogStore';
import PropagateSurveyFormData from '@/pages/Surveys/Dialogs/Propagate/propagate-suvey-form';
import PropagateSurveyDialogBody from '@/pages/Surveys/Dialogs/Propagate/PropagateSurveyDialogBody';
import {createSurveyName} from "@/pages/Surveys/components/create-survey-name.ts";

interface PropagateSurveyDialogProps {
  survey: Survey;
  trigger?: React.ReactNode;
}

const PropagateSurveyDialog = (props: PropagateSurveyDialogProps) => {
  const { trigger, survey } = props;
  const {
    isPropagating,
    errorOnPropagate,
    isOpenPropagateSurveyDialog,
    openPropagateSurveyDialog,
    closePropagateSurveyDialog,
    propagateSurvey,
  } = usePropagateSurveyDialogStore();

  const { t } = useTranslation();

  const initialFormValues: PropagateSurveyFormData = {
    participants: survey?.participants || [],
  };

  const formSchema = z.object({
    survey: z.any(),
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
  });

  const form = useForm<PropagateSurveyFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const { participants } = form.getValues();

    const newSurvey: Survey = {
      ...survey,
      surveyname: createSurveyName(),
      participants: participants,
    }

    await propagateSurvey(newSurvey);
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isPropagating) return <LoadingIndicator isOpen={isPropagating} />;
    return (
      <>
        <PropagateSurveyDialogBody
          form={form}
        />
        {errorOnPropagate ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {errorOnPropagate.message}
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
          disabled={isPropagating}
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
      isOpen={isOpenPropagateSurveyDialog}
      trigger={trigger}
      handleOpenChange={isOpenPropagateSurveyDialog ? closePropagateSurveyDialog : openPropagateSurveyDialog}
      title={t('survey.editing')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default PropagateSurveyDialog;
