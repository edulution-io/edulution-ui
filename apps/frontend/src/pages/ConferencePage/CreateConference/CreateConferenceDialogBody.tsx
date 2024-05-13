import React from 'react';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import RadioGroupFormField, { RadioGroupItem } from '@/components/shared/RadioGroupFormField';
import FormData from '@/pages/ConferencePage/CreateConference/form';

interface CreateConferenceDialogBodyProps {
  form: UseFormReturn<FormData>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { isLoading } = useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <div>Loading...</div>;

  const conferencePrivacyStatus: RadioGroupItem[] = [
    { value: 'true', translationId: 'conferences.public' },
    { value: 'false', translationId: 'conferences.private' },
  ];

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          name="name"
          form={form}
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
        {form.getValues('isPublic') === 'true' ? null : (
          <FormField
            name="password"
            form={form}
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
