import React from 'react';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import RadioGroupFormField, { RadioGroupItem } from '@/components/shared/RadioGroupFormField';

interface CreateConferenceDialogBodyProps {
  form: UseFormReturn;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { isLoading, error } = useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const conferencePrivacyStatus: RadioGroupItem[] = [
    { value: true, translationId: 'conferences.public' },
    { value: false, translationId: 'conferences.private' },
  ];

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          form={form}
          name="name"
          labelTranslationId={t('conferences.name')}
          isLoading={isLoading}
          variant="default"
        />
        <RadioGroupFormField
          name="isPublic"
          titleTranslationId="conferences.privacyStatus"
          defaultValue={conferencePrivacyStatus[0].value}
          control={form.control}
          items={conferencePrivacyStatus}
          formClassname="text-black"
          labelClassname="font-bold text-m"
        />
        {form.getValues('isPublic') ? null : (
          <FormField
            form={form}
            name="password"
            labelTranslationId={t('conferences.password')}
            type="password"
            isLoading={isLoading}
            variant="default"
          />
        )}
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
