import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useUserStore from '@/store/UserStore/UserStore';
import DatePicker from '@/components/shared/DatePicker';
import Checkbox from '@/components/ui/Checkbox';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import TimeInput from '@/components/shared/TimeInput';

interface SaveSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SaveSurveyDialogBody = (props: SaveSurveyDialogBodyProps) => {
  const { form } = props;
  const { setValue, watch, getValues } = form;
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

  const expiresWatched = watch('expires') as Date;
  const isAnonymousWatched = watch('isAnonymous') as boolean;
  const isPublicWatched = watch('isPublic') as boolean;
  const canSubmitMultipleAnswersWatched = watch('canSubmitMultipleAnswers') as boolean;

  const handleExpirationDateChange = (value: Date | undefined) => {
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
        variant="light"
      />
      <p className="text-m font-bold text-foreground">{t('survey.expirationDate')}</p>
      <div className="flex items-center text-foreground">
        {t('common.date')}
        <div className="ml-2">
          <DatePicker
            selected={expiresWatched}
            onSelect={handleExpirationDateChange}
          />
        </div>
      </div>
      <div className="flex items-center text-foreground">
        <TimeInput
          form={form}
          disabled={!getValues('expires')}
          fieldName="expires"
        />
      </div>
      <p className="text-m font-bold text-foreground">{t('surveys.saveDialog.settingsFlags')}</p>
      <div className="flex items-center text-foreground">
        <Checkbox
          checked={isAnonymousWatched}
          onCheckedChange={(value: boolean) => setValue('isAnonymous', value, { shouldValidate: true })}
          aria-label={`${t('survey.isAnonymous')}`}
          label={t('surveys.saveDialog.isAnonymous')}
          className="mr-2"
        />
      </div>
      <div className="flex items-center text-foreground">
        <Checkbox
          checked={isPublicWatched}
          onCheckedChange={(value: boolean) => setValue('isPublic', value, { shouldValidate: true })}
          aria-label={`${t('survey.isPublic')}`}
          label={t('surveys.saveDialog.isPublic')}
          className="mr-2"
        />
      </div>
      <div className="flex items-center text-foreground">
        <Checkbox
          checked={canSubmitMultipleAnswersWatched}
          onCheckedChange={(value: boolean) => setValue('canSubmitMultipleAnswers', value, { shouldValidate: true })}
          aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
          label={t('surveys.saveDialog.canSubmitMultipleAnswers')}
          className="mr-2"
        />
      </div>
    </>
  );
};

export default SaveSurveyDialogBody;
