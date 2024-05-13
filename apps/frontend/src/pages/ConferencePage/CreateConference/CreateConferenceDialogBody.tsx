import React from 'react';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import RadioGroupFormField, { RadioGroupItem } from '@/components/shared/RadioGroupFormField';
import FormData from '@/pages/ConferencePage/CreateConference/form';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';

interface CreateConferenceDialogBodyProps {
  form: UseFormReturn<FormData>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { setValue } = form;
  const { isLoading, searchAttendees } = useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <div>Loading...</div>;

  const handleAttendeesChange = (selectedOptions: MultipleSelectorOptionSH[]) => {
    const attendees = selectedOptions.map((option) => option.value);
    setValue('attendees', attendees, { shouldValidate: true });
  };

  const conferencePrivacyStatus: RadioGroupItem[] = [
    { value: 'true', translationId: 'conferences.public' },
    { value: 'false', translationId: 'conferences.private' },
  ];

  const onAttendeesSearch = async (value: string): Promise<MultipleSelectorOptionSH[]> => {
    const attendees = await searchAttendees(value);

    return attendees.map((a) => ({ value: a.username, label: `${a.firstname} ${a.lastname} (${a.username})` }));
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
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
        <SearchUsersOrGroups
          onSearch={onAttendeesSearch}
          onChange={handleAttendeesChange}
        />
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
