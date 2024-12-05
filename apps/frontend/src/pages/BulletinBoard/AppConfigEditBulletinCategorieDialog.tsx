import React, { useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
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
import { useTranslation } from 'react-i18next';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';
import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';
import { Button } from '@/components/shared/Button';
import DialogSwitch from '@/components/shared/DialogSwitch';

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
    <div className="mt-4 flex justify-end space-x-2">
      {form.getValues('name').trim() === selectedCategory?.name && (
        <Button
          variant="btn-attention"
          size="lg"
          onClick={async () => {
            await deleteCategory(selectedCategory?.id || '');
            setUpdateDeleteEntityDialogOpen(false);
            setSelectedCategory(null);
          }}
        >
          <MdDelete size={20} />
          Delete
        </Button>
      )}

      <Button
        variant="btn-collaboration"
        size="lg"
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
          setSelectedCategory(null);
        }}
      >
        <MdUpdate size={20} />
        Update
      </Button>
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
            placeholder={t('bulletinboard.categoryName')}
          />
        </div>

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={form.watch('isActive')}
          onCheckedChange={(isChecked) => {
            form.setValue('isActive', isChecked);
          }}
        />

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
