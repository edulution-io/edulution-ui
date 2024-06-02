import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import useUserStore from '@/store/userStore';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
import Checkbox from '@/components/ui/Checkbox';
import DatePicker from '@/components/shared/DatePicker';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const PropagateSurveyDialogBody = (props: EditSurveyDialogBodyProps): React.ReactNode => {
  const { form} = props;
  const { searchAttendees } = usePropagateSurveyDialogStore();
  const { user } = useUserStore();

  const { t } = useTranslation();

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[] = []) => {
    const newParticipants = attendees.map((option) => ({
      label: option.label,
      value: option.value,
    }));
    form.setValue('participants', newParticipants, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user);
  };

  return (
    <>
      <DatePicker
        selected={form.getValues('expires')}
        onSelect={(selected: Date[] | undefined) => {
          form.setValue('expires', selected)
        }}
        max={1}
      />
      <Checkbox
        checked={form.getValues('isAnonymous')}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={(checked) => {
          form.setValue('isAnonymous', checked);
        }}
        aria-label={`${t('survey.isAnonymous')}`}
      />
      <Checkbox
        checked={form.getValues('canSubmitMultipleAnswers')}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={(checked) => {
          form.setValue('canSubmitMultipleAnswers', checked);
        }}
        aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
      />
      <SearchUsersOrGroups
        value={form.getValues('participants')}
        onSearch={onAttendeesSearch}
        onChange={handleAttendeesChange}
      />
    </>
  );
};

export default PropagateSurveyDialogBody;
