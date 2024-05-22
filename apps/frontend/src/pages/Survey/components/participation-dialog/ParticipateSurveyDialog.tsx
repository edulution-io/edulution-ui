import React from 'react';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
// import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useParticipateSurveyDialogStore from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogStore';
import ParticipateSurveyDialogBody from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogBody';
// import { SurveyType } from '@/pages/Survey/backend-copy/model';
// import Attendee from '@/pages/ConferencePage/dto/attendee';
import { ScrollArea } from '@/components/ui/ScrollArea';
// import { Button } from '@/components/shared/Button';

interface ParticipateSurveyDialogProps {
  trigger?: React.ReactNode;
}

// interface FormData {
//   surveyname: string;
//   participants: Attendee[];
//   survey: JSON;
//   type: SurveyType;
// }

const ParticipateSurveyDialog = ({ trigger }: ParticipateSurveyDialogProps) => {
  const {
    isParticipateSurveyDialogOpen,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    isLoading,
    error,
    // pushAnswer,
  } = useParticipateSurveyDialogStore();

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
      <ScrollArea>
        <ParticipateSurveyDialogBody // form={form}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </ScrollArea>
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
  //         {t('survey.participate.complete')}
  //       </Button>
  //     </form>
  //   </div>
  // );

  return (
    <AdaptiveDialog
      isOpen={isParticipateSurveyDialogOpen}
      trigger={trigger}
      handleOpenChange={isParticipateSurveyDialogOpen ? closeParticipateSurveyDialog : openParticipateSurveyDialog}
      title={t('survey.participation')}
      body={getDialogBody()}
      // footer={getFooter()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ParticipateSurveyDialog;
