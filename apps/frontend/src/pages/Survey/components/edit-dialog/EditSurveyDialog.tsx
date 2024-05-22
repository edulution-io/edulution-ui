import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useCreateConferenceDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import EditSurveyDialogBody from '@/pages/Survey/components/edit-dialog/EditSurveyDialogBody';
// import { SurveyType } from '@/pages/Survey/backend-copy/model.ts';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import Attendee from '@/pages/ConferencePage/dto/attendee.ts';

interface EditSurveyDialogProps {
  trigger?: React.ReactNode;
}

// interface FormData {
//   surveyname: string;
//   participants: Attendee[];
//   survey: JSON;
//   type: SurveyType;
// }

const EditSurveyDialog = ({ trigger }: EditSurveyDialogProps) => {
  const { isEditSurveyDialogOpen, openEditSurveyDialog, closeEditSurveyDialog, isLoading, error } =
    useCreateConferenceDialogStore();

  const { t } = useTranslation();

  // const initialFormValues: FormData = {
  //   surveyname: '',
  //   participants: [],
  //   survey: JSON,
  //   type: SurveyType.FORMS,
  // };
  //
  // const formSchema = z.object({
  //   surveyname: z.string(),
  //   participants: z.array(
  //     z.intersection(
  //       z.object({
  //         firstName: z.string().optional(),
  //         lastName: z.string().optional(),
  //         username: z.string(),
  //       }),
  //       z.object({
  //         value: z.string(),
  //         label: z.string(),
  //       }),
  //     ),
  //   ),
  //   survey: z.any(),
  //   type: z.string(),
  // });
  //
  // const form = useForm<FormData>({
  //   mode: 'onChange',
  //   resolver: zodResolver(formSchema),
  //   defaultValues: initialFormValues,
  // });
  //
  // const onSubmit = async () => {
  //   const surveyname = form.getValues('surveyname');
  //   const survey = JSON.parse(JSON.stringify(form.getValues('survey')));
  //   pushAnswer({ surveyname, answer: survey.data });
  //   form.reset();
  // };
  //
  // const handleFormSubmit = form.handleSubmit(onSubmit);
  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <>
        <EditSurveyDialogBody // form={form}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </>
    );
  };

  // const getFooter = () => (
  //   <div className="mt-4 flex justify-end">
  //     <form onSubmit={handleFormSubmit}>
  //       <Button
  //         variant="btn-collaboration"
  //         disabled={isLoading}
  //         size="lg"
  //         type="submit"
  //       >
  //         {t('survey.create')}
  //       </Button>
  //     </form>
  //   </div>
  // );

  return (
    <AdaptiveDialog
      isOpen={isEditSurveyDialogOpen}
      trigger={trigger}
      handleOpenChange={isEditSurveyDialogOpen ? closeEditSurveyDialog : openEditSurveyDialog}
      title={t('survey.editing')}
      body={getDialogBody()}
      desktopContentClassName="min-h-[75%] max-w-[75%]"
    />
  );
};

export default EditSurveyDialog;
