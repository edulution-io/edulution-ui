import React from 'react';
// import { UseFormReturn } from 'react-hook-form';
// import { Form } from '@/components/ui/Form';
import ParticipateSurvey from '@/pages/Survey/components/participation-dialog/ParticipateSurvey';
//
// interface ParticipateSurveyDialogBodyProps {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   form: UseFormReturn<any>;
// }

const ParticipateSurveyDialogBody = (/* { form }: ParticipateSurveyDialogBodyProps */) => (
  // <Form {...form}>
  //   <form
  //     className="space-y-4"
  //     onSubmit={(event) => {
  //       event.preventDefault();
  //     }}
  //   >
  <ParticipateSurvey />
  //   </form>
  // </Form>
);

export default ParticipateSurveyDialogBody;
