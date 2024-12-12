import React, { useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
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
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';
import { Button } from '@/components/shared/Button';
import DialogSwitch from '@/components/shared/DialogSwitch';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { Form } from '@/components/ui/Form';

const CreateAndUpdateBulletinCategoryDialog = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    updateCategory,
    deleteCategory,
    addNewCategory,
    checkIfNameExists,
    nameExistsAlready,
    isNameChecking,
  } = useBulletinCategoryTableStore();

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

  const { setValue, watch, reset, getValues } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedCategory, form]);
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();

  const handleFormSubmit = async () => {
    if (selectedCategory) {
      const { name, isActive, visibleForUsers, visibleForGroups, editableByUsers, editableByGroups } = getValues();

      await updateCategory(selectedCategory?.id || '', {
        name: name && name.trim() !== '' ? name : selectedCategory.name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
      });
    } else {
      await addNewCategory(getValues());
    }
    setDialogOpen(false);
    setSelectedCategory(null);
    reset();
  };

  const getFooter = () => (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-4"
    >
      <div className="mt-4 flex justify-end space-x-2">
        {getValues('name').trim() === selectedCategory?.name && (
          <Button
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={async () => {
              await deleteCategory(selectedCategory?.id || '');
              setDialogOpen(false);
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
          disabled={nameExistsAlready || nameExistsAlready === null || isNameChecking}
          type="submit"
        >
          <MdUpdate size={20} />
          {t('common.save')}
        </Button>
      </div>
    </form>
  );

  const getDialogBody = () => {
    const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('visibleForUsers', attendees, { shouldValidate: true });
    };

    const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
      setValue('editableByUsers', attendees, { shouldValidate: true });
    };

    return (
      <Form {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleFormSubmit();
          }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <p>{t('bulletinboard.categoryName')}:</p>
            <NameInputWithAvailability
              value={form.watch('name')}
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
          <p className="pt-4 text-foreground">{t('bulletinboard.categories.visibleByUsersAndGroups')}</p>
          <SearchUsersOrGroups
            users={watch('visibleForUsers') as AttendeeDto[]}
            onSearch={searchAttendees}
            onUserChange={handleVisibleAttendeesChange}
            groups={watch('visibleForGroups') as MultipleSelectorGroup[]}
            onGroupSearch={searchGroups}
            onGroupsChange={(groups) => setValue('visibleForGroups', groups, { shouldValidate: true })}
            variant="light"
          />
          <p className="pt-4 text-foreground">{t('bulletinboard.categories.editableByUsersAndGroups')}</p>
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
      </Form>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isDialogOpen}
      handleOpenChange={() => {
        setDialogOpen(!isDialogOpen);
        setSelectedCategory(null);
      }}
      title=""
      body={getDialogBody()}
      footer={getFooter()}
      mobileContentClassName="bg-black h-fit h-max-1/2"
    />
  );
};

export default CreateAndUpdateBulletinCategoryDialog;
