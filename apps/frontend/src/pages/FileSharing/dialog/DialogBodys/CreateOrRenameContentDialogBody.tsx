import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/Form';
import React from 'react';
import FormField from '@/components/shared/FormField';

export interface CreateNewContentDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}
const CreateOrRenameContentDialogBody: React.FC<CreateNewContentDialogBodyProps> = ({ form }) => (
  <Form {...form}>
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <FormField
        name="filename"
        form={form}
        labelTranslationId=""
        isLoading={false}
        variant="default"
      />
    </form>
  </Form>
);

export default CreateOrRenameContentDialogBody;
