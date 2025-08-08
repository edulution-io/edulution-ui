/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import useLmnApiStore from '@/store/useLmnApiStore';
import parseSophomorixQuota from '@libs/lmnApi/utils/parseSophomorixQuota';
import parseSophomorixMailQuota from '@libs/lmnApi/utils/parseSophomorixMailQuota';
import AttendeeDto from '@libs/user/types/attendee.dto';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

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
    quota: '',
    mailquota: '0',
    mailalias: false,
    maillist: false,
    join: true,
    hide: false,
    admins: [],
    admingroups: [],
    members: [],
    membergroups: [],
    school: user?.school || '',
    proxyAddresses: '',
  };

  const form = useForm<GroupForm>({
    mode: 'onChange',
    resolver: zodResolver(getGroupFormSchema(t)),
    defaultValues: initialFormValues,
  });

  const getSelectOptionsFromLmnUsers = (users: LmnUserInfo[]) =>
    users.map(
      (lmnUser) =>
        ({
          ...lmnUser,
          id: lmnUser.dn,
          path: lmnUser.dn,
          value: lmnUser.cn,
          label: `${lmnUser.displayName} (${lmnUser.sophomorixAdminClass})`,
          username: lmnUser.cn,
        }) as AttendeeDto,
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
    form.setValue(
      'displayName',
      (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).displayName || userGroupToEdit.name || '',
    );
    form.setValue(
      'school',
      (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixSchoolname || DEFAULT_SCHOOL,
    );
    form.setValue('join', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixJoinable || false);
    form.setValue('hide', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixHidden || false);
    form.setValue('mailalias', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixMailAlias || false);
    form.setValue('quota', parseSophomorixQuota((userGroupToEdit as LmnApiProject).sophomorixAddQuota));
    form.setValue('mailquota', parseSophomorixMailQuota((userGroupToEdit as LmnApiProject).sophomorixAddMailQuota));
    form.setValue('creationDate', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixCreationDate || '');
    form.setValue('maillist', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).sophomorixMailList || false);
    form.setValue('description', (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).description || '');
    form.setValue(
      'proxyAddresses',
      (userGroupToEdit as LmnApiProject | LmnApiSchoolClass).proxyAddresses?.join(',') || '',
    );
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
      setIsFetching(false);

      if (!fetchedGroup) {
        return;
      }

      setFormInitialValues(fetchedGroup);
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

  const disableDialogButtons = isDialogLoading || isFetching;

  const getFooter = () => (
    <div className="flex gap-4">
      {item.createFunction && userGroupToEdit && (
        <Button
          className="mt-4"
          variant="btn-attention"
          disabled={isDialogLoading}
          size="lg"
          type="button"
          onClick={onDeleteButton}
        >
          {t('delete')}
        </Button>
      )}

      <form onSubmit={handleFormSubmit}>
        <DialogFooterButtons
          handleClose={onClose}
          handleSubmit={item.createFunction ? () => {} : undefined}
          submitButtonType="submit"
          disableSubmit={disableDialogButtons}
          disableCancel={disableDialogButtons}
          cancelButtonText={item.createFunction ? 'cancel' : 'common.close'}
          submitButtonText={userGroupToEdit ? 'common.save' : 'common.create'}
        />
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
      isOpen
      trigger={trigger}
      handleOpenChange={isDialogLoading ? () => {} : onClose}
      title={t(getTitle())}
      desktopContentClassName="max-w-4xl"
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default GroupDialog;
