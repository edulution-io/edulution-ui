import React, { useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { MdDelete, MdUpdate } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import NewCategorieForm from '@libs/bulletinBoard/constants/NewCategorieForm';
import { zodResolver } from '@hookform/resolvers/zod';
import getCreateNewCategorieSchema from '@libs/bulletinBoard/constants/createNewCategorieSchema';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { useTranslation } from 'react-i18next';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';
import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';

const AppConfigEditBulletinCategorieDialog = () => {
  const { selectedCategory, setSelectedCategory, updateCategory, deleteCategory } = useAppConfigBulletinTableStore();

  const { t } = useTranslation();

  const form = useForm<NewCategorieForm>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: {
      name: selectedCategory?.name || '',
      isActive: selectedCategory?.isActive ?? true,
      visibleByUsers: selectedCategory?.visibleForUsers || [],
      visibleByGroups: selectedCategory?.visibleForGroups || [],
      editableByUsers: selectedCategory?.editableByUsers || [],
      editableByGroups: selectedCategory?.editableByGroups || [],
    },
  });

  const { checkIfNameExists, nameExists, isNameChecking } = useAppConfigBulletinTableStore();

  const { isUpdateDeleteEntityDialogOpen, setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();

  const getFooter = () => (
    <div className="flex items-center justify-between p-4">
      {form.getValues('name').trim() === selectedCategory?.name && (
        <ButtonSH
          variant="danger"
          className="flex items-center gap-2 bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          onClick={async () => {
            await deleteCategory(selectedCategory?.id || '');
            setUpdateDeleteEntityDialogOpen(false);
          }}
        >
          <MdDelete size={20} />
          Delete
        </ButtonSH>
      )}

      <ButtonSH
        variant="outline"
        className="flex items-center gap-2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        disabled={nameExists || isNameChecking}
        onClick={async () => {
          const { name, isActive, visibleByUsers, visibleByGroups, editableByUsers, editableByGroups } =
            form.getValues();

          await updateCategory(selectedCategory?.id || '', {
            name: name && name.trim() !== '' ? name : selectedCategory!.name,
            isActive,
            visibleForUsers: visibleByUsers,
            visibleForGroups: visibleByGroups,
            editableByUsers,
            editableByGroups,
          });

          setUpdateDeleteEntityDialogOpen(false);
        }}
      >
        <MdUpdate size={20} />
        Update
      </ButtonSH>
    </div>
  );

  const getDialogBody = () => {
    const { setValue, watch } = form;
    const { searchAttendees } = useUserStore();
    const { searchGroups } = useGroupStore();

    const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('visibleByUsers', attendees, { shouldValidate: true });
    };

    const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('editableByUsers', attendees, { shouldValidate: true });
    };

    useEffect(() => {
      if (selectedCategory) {
        setValue('visibleByUsers', selectedCategory.visibleForUsers || []);
        setValue('visibleByGroups', selectedCategory.visibleForGroups || []);
        setValue('editableByUsers', selectedCategory.editableByUsers || []);
        setValue('editableByGroups', selectedCategory.editableByGroups || []);
      }
    }, [selectedCategory, setValue]);

    return (
      <form
        onSubmit={() => {}}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <p>{t('bulletinboard.categoryName')}:</p>
          <NameInputWithAvailability
            register={form.register}
            checkIfNameExists={checkIfNameExists}
            placeholder="Enter category name"
          />
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
      </form>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isUpdateDeleteEntityDialogOpen}
      variant="primary"
      handleOpenChange={() => {
        setUpdateDeleteEntityDialogOpen(!isUpdateDeleteEntityDialogOpen);
        setSelectedCategory(null);
      }}
      title=""
      body={getDialogBody()}
      footer={getFooter()}
      mobileContentClassName="bg-black h-fit h-max-1/2"
    />
  );
};

export default AppConfigEditBulletinCategorieDialog;
