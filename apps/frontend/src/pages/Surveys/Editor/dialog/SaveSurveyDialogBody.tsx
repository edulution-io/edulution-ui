import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
// import DatePicker from '@/components/shared/DatePicker';
import Checkbox from '@/components/ui/Checkbox';
// import TimeInput from '@/components/shared/TimeInput';
import DateTimeInput, { TimeInputType } from '@/components/shared/DateTimePicker/DateTimeInput';

interface SaveSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SaveSurveyDialogBody = (props: SaveSurveyDialogBodyProps) => {
  const { form } = props;
  const { setValue, watch /* , getValues */ } = form;
  const { user } = useUserStore();
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();
  const { t } = useTranslation();

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    if (!user) {
      return result;
    }
    return result.filter((r) => r.username !== user.username);
  };

  const handleGroupsChange = (groups: MultipleSelectorOptionSH[]) => {
    setValue('invitedGroups', groups /* , { shouldValidate: true } */);
  };

  const expiresWatched = watch('expires') as TimeInputType;
  const isAnonymousWatched = watch('isAnonymous') as boolean;
  const isPublicWatched = watch('isPublic') as boolean;
  const canSubmitMultipleAnswersWatched = watch('canSubmitMultipleAnswers') as boolean;

  const handleExpirationDateChange = (value: TimeInputType /* Date | undefined */) => {
    setValue('expires', value);
  };

  return (
    <>
      <SearchUsersOrGroups
        users={watch('invitedAttendees') as AttendeeDto[]}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        variant="dialog"
      />
      <p className="text-m font-bold text-background">{t('survey.expirationDate')}</p>
      {/* <div className="flex items-center"> */}
      {/*  {t('common.date')} */}
      {/*  <div className="ml-2"> */}
      {/*    <DatePicker */}
      {/*      selected={expiresWatched} */}
      {/*      onSelect={handleExpirationDateChange} */}
      {/*    /> */}
      {/*  </div> */}
      {/* </div> */}
      {/* <div className="flex items-center text-background"> */}
      {/*  <TimeInput */}
      {/*    form={form} */}
      {/*    disabled={!getValues('expires')} */}
      {/*    fieldName="expires" */}
      {/*  /> */}
      {/* </div> */}
      <DateTimeInput
        value={expiresWatched}
        onChange={handleExpirationDateChange}
      />
      <p className="text-m font-bold text-background">{t('surveys.saveDialog.settingsFlags')}</p>
      <div className="ttext-background flex items-center">
        <Checkbox
          checked={isAnonymousWatched}
          onCheckedChange={(value: boolean) => setValue('isAnonymous', value, { shouldValidate: true })}
          aria-label={`${t('survey.isAnonymous')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.isAnonymous')}
      </div>
      <div className="flex items-center text-background">
        <Checkbox
          checked={isPublicWatched}
          onCheckedChange={(value: boolean) => setValue('isPublic', value, { shouldValidate: true })}
          aria-label={`${t('survey.isPublic')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.isPublic')}
      </div>
      <div className="flex items-center text-background">
        <Checkbox
          checked={canSubmitMultipleAnswersWatched}
          onCheckedChange={(value: boolean) => setValue('canSubmitMultipleAnswers', value, { shouldValidate: true })}
          aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.canSubmitMultipleAnswers')}
      </div>
    </>
  );
};

export default SaveSurveyDialogBody;
