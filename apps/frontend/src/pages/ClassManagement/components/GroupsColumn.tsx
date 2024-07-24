import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateGroupButton from '@/pages/ClassManagement/components/CreateGroupButton';
import GroupCard from '@/pages/ClassManagement/components/GroupCard';
import GroupColumn from '@libs/groups/types/groupColumn';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import UserGroups from '@libs/groups/types/userGroups.enum';
import GroupDto from '@libs/groups/types/group.dto';
import Session from '@libs/classManagement/types/session';
import useUserStore from '@/store/UserStore/UserStore';

interface GroupsColumnProps {
  column: GroupColumn;
}

const GroupsColumn = ({ column }: GroupsColumnProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [openDialogType, setOpenDialogType] = useState<UserGroups | null>(null);
  const [userGroupToEdit, setUserGroupToEdit] = useState<Session | GroupDto | null>(null);
  const { createFunction, name, translationId, icon, groups } = column;

  if (!groups || !Array.isArray(groups)) {
    return null;
  }

  const groupCards = groups.map(
    (group) =>
      (
        <GroupCard
          type={name}
          key={user!.username + group.name}
          group={group}
          icon={icon}
          setUserGroupToEdit={setUserGroupToEdit}
          setOpenDialogType={setOpenDialogType}
        />
      ) || [],
  );

  return (
    <>
      <p className="mb-4 text-center text-2xl">{t(`classmanagement.${translationId}`)}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {groupCards.length ? groupCards : <p>{t('classmanagement.noneAvailable')}</p>}
      </div>
      <div className="mt-1 flex justify-center">
        {createFunction && (
          <CreateGroupButton
            handleButtonClick={() => {
              setOpenDialogType(name);
              setUserGroupToEdit(null);
            }}
            title={t(`classmanagement.add${name}`)}
          />
        )}
      </div>
      <GroupDialog
        item={column}
        openDialog={openDialogType}
        setOpenDialogType={setOpenDialogType}
        userGroupToEdit={userGroupToEdit}
      />
    </>
  );
};

export default GroupsColumn;
