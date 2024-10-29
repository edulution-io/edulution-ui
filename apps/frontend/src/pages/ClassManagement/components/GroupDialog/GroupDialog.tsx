import React, { useEffect, useState } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import GroupForm from '@libs/groups/types/groupForm';
import getGroupFormSchema from '@libs/groups/constants/groupFormSchema';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupDialogBody from '@/pages/ClassManagement/components/GroupDialog/GroupDialogBody';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import CircleLoader from '@/components/ui/CircleLoader';
import LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import useLmnApiStore from '@/store/useLmnApiStore';

interface GroupDialogProps {
  item: GroupColumn;
  trigger?: React.ReactNode;
}

const GroupDialog = ({ item, trigger }: GroupDialogProps) => {
  const { setOpenDialogType, openDialogType, userGroupToEdit, setUserGroupToEdit, member } = useLessonStore();
  const { user } = useLmnApiStore();
  const [isFetching, setIsFetching] = useState(false);
  const { t } = useTranslation();

  const {
    isSessionLoading,
    isSchoolClassLoading,
    isProjectLoading,
    userSessions,
    fetchProject,
    fetchSchoolClass,
    fetchUserSessions,
    fetchUserProjects,
    fetchUserSchoolClasses,
  } = useClassManagementStore();

  const initialFormValues: GroupForm = {
    id: '',
    name: '',
    displayName: '',
    description: '',
    quota: [],
    mailquota: 0,
    mailalias: false,
    maillist: false,
    join: true,
    hide: false,
    admins: [],
    admingroups: [],
    members: [],
    membergroups: [],
    school: user?.school || '',
    proxyAddresses: [],
  };

  const form = useForm<GroupForm>({
    mode: 'onChange',
    resolver: zodResolver(getGroupFormSchema(t)),
    defaultValues: initialFormValues,
  });

  const getSelectOptionsFromLmnUsers = (users: UserLmnInfo[]) =>
    users.map(
      (lmnUser) =>
        ({
          ...lmnUser,
          id: lmnUser.dn,
          path: lmnUser.dn,
          value: lmnUser.cn,
          label: `${lmnUser.displayName} (${lmnUser.sophomorixAdminClass})`,
        }) as unknown as MultipleSelectorOptionSH,
    );

  const setFormInitialValues = (
    fetchedGroup: LmnApiSchoolClassWithMembers | LmnApiProjectWithMembers | LmnApiSession | LmnApiPrinterWithMembers,
  ) => {
    if (!userGroupToEdit) return;

    form.setValue(
      'id',
      (userGroupToEdit as LmnApiSession).sid || (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).cn || '',
    );
    form.setValue('name', userGroupToEdit.name || '');
    form.setValue('displayName', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).displayName || '');
    form.setValue(
      'school',
      (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixSchoolname || DEFAULT_SCHOOL,
    );
    form.setValue('join', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixJoinable || false);
    form.setValue('hide', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixHidden || false);
    form.setValue('mailalias', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixMailAlias || false);
    form.setValue('creationDate', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixCreationDate || '');
    form.setValue('maillist', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixMailList || false);
    form.setValue('description', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).description || '');
    form.setValue('proxyAddresses', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).proxyAddresses || []);
    form.setValue('members', getSelectOptionsFromLmnUsers(fetchedGroup.members));
    if ((fetchedGroup as LmnApiProjectWithMembers | LmnApiSchoolClassWithMembers).admins) {
      form.setValue(
        'admins',
        getSelectOptionsFromLmnUsers((fetchedGroup as LmnApiSchoolClassWithMembers | LmnApiProjectWithMembers).admins),
      );
    }
  };

  useEffect(() => {
    if (!userGroupToEdit) {
      form.reset(initialFormValues);
      form.setValue('members', getSelectOptionsFromLmnUsers(member));
      return;
    }

    const fetchData = async () => {
      if (isFetching) return;
      setIsFetching(true);

      let fetchedGroup;
      switch (openDialogType) {
        case UserGroups.Projects:
          fetchedGroup = await fetchProject(userGroupToEdit.name);
          break;
        case UserGroups.Sessions:
          fetchedGroup = userSessions.find((session) => session.name === userGroupToEdit.name);
          break;
        case UserGroups.Classes:
          fetchedGroup = await fetchSchoolClass(userGroupToEdit.name);
          break;
        default:
      }
      if (!fetchedGroup) {
        return;
      }

      setFormInitialValues(fetchedGroup);
      setIsFetching(false);
    };
    void fetchData();
  }, [userGroupToEdit?.name]);

  const onClose = () => {
    setOpenDialogType(null);
    setUserGroupToEdit(null);
    form.reset();
  };

  const updateGroupsAndCloseDialog = async () => {
    onClose();
    switch (openDialogType) {
      case UserGroups.Projects:
        await fetchUserProjects();
        break;
      case UserGroups.Sessions:
        await fetchUserSessions();
        break;
      case UserGroups.Classes:
        await fetchUserSchoolClasses();
        break;
      default:
    }
  };

  const onSubmit = async () => {
    if (userGroupToEdit) {
      if (item.updateFunction) {
        await item.updateFunction(form);
      }
    } else if (item.createFunction) {
      await item.createFunction(form);
    }
    await updateGroupsAndCloseDialog();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const isDialogLoading = isProjectLoading || isSchoolClassLoading || isSessionLoading;
  const getDialogBody = () => {
    if (isDialogLoading || isFetching) return <CircleLoader className="mx-auto" />;
    return (
      <GroupDialogBody
        form={form}
        type={item.name}
        isCreateMode={!userGroupToEdit}
        disabled={item.name === UserGroups.Classes || !item.updateFunction}
      />
    );
  };

  const onDeleteButton = async () => {
    await item.removeFunction?.(form.getValues('id'));
    await updateGroupsAndCloseDialog();
  };

  const getFooter = () => (
    <div className="mt-4 flex">
      {userGroupToEdit ? (
        <Button
          className="mr-4"
          variant="btn-attention"
          disabled={isDialogLoading}
          size="lg"
          type="button"
          onClick={onDeleteButton}
        >
          {t('delete')}
        </Button>
      ) : null}

      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isDialogLoading}
          size="lg"
          type="submit"
        >
          {t(userGroupToEdit ? 'common.save' : 'common.create')}
        </Button>
      </form>
    </div>
  );

  const getTitle = () => {
    if (item.updateFunction && userGroupToEdit) return `classmanagement.edit${item.translationId}`;
    if (item.createFunction) return `classmanagement.create${item.translationId}`;
    return `classmanagement.details${item.translationId}`;
  };

  return (
    <AdaptiveDialog
      isOpen={openDialogType === item.name}
      trigger={trigger}
      handleOpenChange={onClose}
      title={t(getTitle())}
      desktopContentClassName="max-w-4xl"
      body={getDialogBody()}
      footer={item.createFunction ? getFooter() : null}
    />
  );
};

export default GroupDialog;
