import React from 'react';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { FilesharingDialogProps } from '@libs/filesharing/FilesharingDialogProps';

const CreateOrRenameContentDialogBody: React.FC<FilesharingDialogProps> = ({ form }) => (
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
