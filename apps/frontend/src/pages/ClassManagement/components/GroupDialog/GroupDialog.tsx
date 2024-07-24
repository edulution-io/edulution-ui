import React, { useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import GroupForm from '@libs/groups/types/groupForm';
import getGroupFormSchema from '@libs/groups/constants/groupFormSchema';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupDialogBody from '@/pages/ClassManagement/components/GroupDialog/GroupDialogBody';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import Session from '@libs/classManagement/types/session';
import GroupDto from '@libs/groups/types/group.dto';

interface GroupDialogProps {
  item: GroupColumn;
  trigger?: React.ReactNode;
  openDialog: UserGroups | null;
  setOpenDialogType: React.Dispatch<React.SetStateAction<UserGroups | null>>;
  userGroupToEdit: Session | GroupDto | null;
}

const GroupDialog = ({ item, trigger, openDialog, setOpenDialogType, userGroupToEdit }: GroupDialogProps) => {
  const { t } = useTranslation();
  const { isDialogLoading } = useClassManagementStore();

  const initialFormValues: GroupForm = {
    name: '',
    description: '',
    quota: '',
    mailquota: '',
    join: true,
    hide: false,
    admins: [],
    admingroups: [],
    members: [],
    membergroups: [],
    school: 'default-school',
  };

  const form = useForm<GroupForm>({
    mode: 'onChange',
    resolver: zodResolver(getGroupFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (userGroupToEdit) {
      form.setValue('name', userGroupToEdit.name);
      form.setValue(
        'members',
        userGroupToEdit.members.map((member) => ({
          ...member,
          value: member.username,
          label: `${member.firstName} ${member.lastName} (${member.username})`,
        })),
      );
    } else {
      form.reset(initialFormValues);
    }
  }, [userGroupToEdit, form]);

  const onSubmit = async () => {
    if (item.createFunction) {
      item.createFunction(form);
    }
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isDialogLoading) return <LoadingIndicator isOpen={isDialogLoading} />;
    return (
      <GroupDialogBody
        form={form}
        type={item.name}
        isCreateMode={!!userGroupToEdit}
      />
    );
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isDialogLoading}
          size="lg"
          type="submit"
        >
          {t('common.create')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={!!openDialog}
      trigger={trigger}
      handleOpenChange={() => setOpenDialogType(null)}
      title={t(
        userGroupToEdit ? `classmanagement.edit${item.translationId}` : `classmanagement.create${item.translationId}`,
      )}
      desktopContentClassName="max-w-4xl"
      body={getDialogBody()}
      footer={item.createFunction ? getFooter() : null}
    />
  );
};

export default GroupDialog;
