import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import getCreateNewCategorieSchema from '@libs/bulletinBoard/constants/createNewCategorieSchema';
import NewCategorieForm from '@libs/bulletinBoard/constants/NewCategorieForm';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { debounce } from 'lodash';

const CreateBulletinCategorieTableDialog = ({ closeDialog }: { closeDialog: () => void }) => {
  const { t } = useTranslation();
  const { addNewCategory, checkIfNameExists } = useAppConfigBulletinTable();
  const { user, getOwnUser } = useLmnApiStore();
  const [nameAvailability, setNameAvailability] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  useEffect(() => {
    if (!user) {
      void getOwnUser();
    }
  }, [user]);

  const form = useForm<NewCategorieForm>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: {
      name: '',
      isActive: true,
      visibleByUsers: [],
      visibleByGroups: [],
      editableByUsers: [],
      editableByGroups: [],
    },
  });

  const { setValue, watch } = form;
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const debouncedCheckName = useMemo(
    () =>
      debounce(async (name: string) => {
        if (!name) {
          setNameAvailability('');
          return;
        }

        setIsChecking(true);
        try {
          const exists = await checkIfNameExists(name);
          console.log('exists', exists);
          setNameAvailability(exists ? t('bulletinBoard.nameExists') : t('bulletinBoard.nameAvailable'));
        } catch (error) {
          setNameAvailability(t('bulletinBoard.checkFailed'));
        } finally {
          setIsChecking(false);
        }
      }, 300),
    [checkIfNameExists, t],
  );

  useEffect(() => {
    const subscription = watch(({ name }) => {
      if (name !== undefined) {
        void debouncedCheckName(name);
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedCheckName.cancel();
    };
  }, [watch, debouncedCheckName]);

  const nameValue = useWatch({
    control: form.control,
    name: 'name',
  });

  useEffect(() => {
    void debouncedCheckName(nameValue || '');
  }, [nameValue, debouncedCheckName]);

  const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('visibleByUsers', attendees, { shouldValidate: true });
  };

  const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('editableByUsers', attendees, { shouldValidate: true });
  };

  const handleFormSubmit = async () => {
    const name = form.getValues('name');
    const isActive = form.getValues('isActive');
    const visibleForUsers = form.getValues('visibleByUsers');
    const visibleForGroups = form.getValues('visibleByGroups');
    const editableByUsers = form.getValues('editableByUsers');
    const editableByGroups = form.getValues('editableByGroups');

    if (!user) return;
    const { givenName, sophomorixSurnameASCII, name: username, displayName } = user;

    const createdBy = {
      firstName: sophomorixSurnameASCII,
      lastName: givenName,
      username,
      value: username,
      label: `${displayName} (${username})`,
    } as MultipleSelectorOptionSH;

    try {
      await addNewCategory({
        name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
        createdBy,
      });
      console.log('Category added successfully');
      closeDialog();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  return (
    <form
      onSubmit={async () => {
        await handleFormSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <input
          {...form.register('name')}
          placeholder={t('bulletinBoard.categoryNamePlaceholder')}
          className="input-class"
        />
        <div className="mt-1 text-sm">{isChecking ? t('bulletinBoard.checkingName') : nameAvailability}</div>
      </div>
      <SearchUsersOrGroups
        users={watch('visibleByUsers') as AttendeeDto[]}
        onSearch={searchAttendees}
        onUserChange={handleVisibleAttendeesChange}
        groups={watch('visibleByGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={(groups) => setValue('visibleByGroups', groups, { shouldValidate: true })}
        variant="light"
      />

      <SearchUsersOrGroups
        users={watch('editableByUsers') as AttendeeDto[]}
        onSearch={searchAttendees}
        onUserChange={handleEditableAttendeesChange}
        groups={watch('editableByGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={(groups) => setValue('editableByGroups', groups, { shouldValidate: true })}
        variant="light"
      />

      <div>
        <span className="text-sm font-medium">{t('bulletinBoard.isActive')}</span>
        <RadioGroupSH
          value={watch('isActive') ? 'true' : 'false'}
          onValueChange={(value) => setValue('isActive', value === 'true', { shouldValidate: true })}
          className="flex gap-4"
        >
          <span className="flex items-center gap-2">
            <RadioGroupItemSH
              value="true"
              id="isActive-yes"
            />
            <span>{t('common.yes')}</span>
          </span>
          <span className="flex items-center gap-2">
            <RadioGroupItemSH
              value="false"
              id="isActive-no"
            />
            <span>{t('common.no')}</span>
          </span>
        </RadioGroupSH>
      </div>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="submit"
        disabled={nameAvailability === t('bulletinBoard.nameExists') || isChecking}
      >
        {t('common.create')}
      </Button>
    </form>
  );
};

export default CreateBulletinCategorieTableDialog;
