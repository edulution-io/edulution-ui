import React from 'react';
// import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import useUserStore from '@/store/userStore';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Propagate/PropagateSurveyDialogStore';
// import Checkbox from '@/components/ui/Checkbox';
// import DatePicker from '@/components/shared/DatePicker';
import { Form } from '@/components/ui/Form';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const PropagateSurveyDialogBody = (props: EditSurveyDialogBodyProps): React.ReactNode => {
  const { form} = props;
  const { searchAttendees } = usePropagateSurveyDialogStore();
  const { user } = useUserStore();

  // const { t } = useTranslation();

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

  // const onExpiredDateChange = async (value: Date | undefined) => {
  //   form.setValue('expires', value)
  // }
  //
  // const onIsAnonymousChange = async (value: boolean) => {
  //   form.setValue('isAnonymous', value)
  // }
  //
  // const onCanSubmitMultipleAnswersChange = async (value: boolean) => {
  //   form.setValue('isAnonymous', value)
  // }

  return (
    <Form {...form}>
      <form
        className="text-black"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {/* TODO: Activate the following fields (they do not update soberly)! */}
        {/*<div>*/}
        {/*  {t('expires')}*/}
        {/*  <DatePicker*/}
        {/*    selected={form.getValues('expires')}*/}
        {/*    onSelect={onExpiredDateChange}*/}
        {/*  />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  {t('survey.isAnonymous')}*/}
        {/*  <Checkbox*/}
        {/*    checked={form.getValues('isAnonymous')}*/}
        {/*    // onClick={(e) => e.stopPropagation()}*/}
        {/*    onCheckedChange={onIsAnonymousChange}*/}
        {/*    aria-label={`${t('survey.isAnonymous')}`}*/}
        {/*  />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*  {t('survey.canSubmitMultipleAnswers')}*/}
        {/*  <Checkbox*/}
        {/*    checked={form.getValues('canSubmitMultipleAnswers')}*/}
        {/*    // onClick={(e) => e.stopPropagation()}*/}
        {/*    onCheckedChange={onCanSubmitMultipleAnswersChange}*/}
        {/*    aria-label={`${t('survey.canSubmitMultipleAnswers')}`}*/}
        {/*  />*/}
        {/*</div>*/}
        <SearchUsersOrGroups
          value={form.getValues('participants')}
          onSearch={onAttendeesSearch}
          onChange={handleAttendeesChange}
        />
      </form>
    </Form>
  );
};

export default PropagateSurveyDialogBody;
