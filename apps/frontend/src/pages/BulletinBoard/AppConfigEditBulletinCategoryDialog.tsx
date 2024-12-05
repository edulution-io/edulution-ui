import React, { useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import { MdDelete, MdUpdate } from 'react-icons/md';
import { useForm } from 'react-hook-form';
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
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';

const AppConfigEditBulletinCategoryDialog = ({ closeDialog }: { closeDialog: () => void }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    updateCategory,
    deleteCategory,
    addNewCategory,
    checkIfNameExists,
    nameExists,
    isNameChecking,
  } = useAppConfigBulletinTableStore();

  const { t } = useTranslation();

  const initialFormValues = selectedCategory || {
    name: '',
    isActive: true,
    visibleForUsers: [],
    visibleForGroups: [],
    editableByUsers: [],
    editableByGroups: [],
  };

  const form = useForm<CreateBulletinCategoryDto>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [selectedCategory, form]);

  const { setValue, watch } = form;
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const { isUpdateDeleteEntityDialogOpen, setUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();

  const handleFormSubmit = async () => {
    if (selectedCategory) {
      const { name, isActive, visibleForUsers, visibleForGroups, editableByUsers, editableByGroups } = form.getValues();

      await updateCategory(selectedCategory?.id || '', {
        name: name && name.trim() !== '' ? name : selectedCategory.name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
      });

      setUpdateDeleteEntityDialogOpen(false);
      setSelectedCategory(null);
    } else {
      await addNewCategory(form.getValues());
      closeDialog();
    }
  };

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
          {t('common.delete')}
        </Button>
      )}

      <Button
        variant="btn-collaboration"
        size="lg"
        disabled={nameExists || isNameChecking}
        type="submit"
      >
        <MdUpdate size={20} />
        {t('common.save')}
      </Button>
    </div>
  );

  const getDialogBody = () => {
    const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('visibleForUsers', attendees, { shouldValidate: true });
    };

    const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('editableByUsers', attendees, { shouldValidate: true });
    };

    useEffect(() => {
      if (selectedCategory) {
        setValue('visibleForUsers', selectedCategory.visibleForUsers || []);
        setValue('visibleForGroups', selectedCategory.visibleForGroups || []);
        setValue('editableByUsers', selectedCategory.editableByUsers || []);
        setValue('editableByGroups', selectedCategory.editableByGroups || []);
      }
    }, [selectedCategory, setValue]);

    return (
      <form
        onSubmit={handleFormSubmit}
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
          users={watch('visibleForUsers') as AttendeeDto[]}
          onSearch={searchAttendees}
          onUserChange={handleVisibleAttendeesChange}
          groups={watch('visibleForGroups') as MultipleSelectorGroup[]}
          onGroupSearch={searchGroups}
          onGroupsChange={(groups) => setValue('visibleForGroups', groups, { shouldValidate: true })}
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

export default AppConfigEditBulletinCategoryDialog;
