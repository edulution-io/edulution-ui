import React, { FC, useState } from 'react';
import GroupCard from '@/pages/SchoolmanagementPage/components/GroupCard';
import { MdGroups } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { translateKey } from '@/utils/common';
import { ItemTypes } from '@/pages/SchoolmanagementPage/utilis/enums';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes.ts';
import { GroupCardRowProps } from '@/pages/SchoolmanagementPage/utilis/types.ts';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';

const SessionContent: FC<GroupCardRowProps> = ({
  sessions,
  setIsCreateDialogOpen,
  setDialogTitle,
  setCreateContentType,
}) => {
  const [activeSession, setActiveSession] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsEditModalOpen, setIsDeleteModalOpen, setIsCopyModalOpen } = useSchoolManagementComponentStore();

  const appendSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  };

  const handleItemClicked = (className: string) => {
    if (activeSession === className) {
      setActiveSession(undefined);
      appendSearchParams('session', '');
      return;
    }
    setActiveSession(className);
    appendSearchParams('session', className);
  };

  return !sessions ? (
    <GroupCard
      title={translateKey('schoolManagement.newGroup')}
      isAddNew
      onAdd={() => {
        if (setIsCreateDialogOpen && setDialogTitle && setCreateContentType) {
          setDialogTitle(translateKey('schoolManagement.createGroup'));
          setCreateContentType(CreateContentTypes.CREATE_GROUP);
          setIsCreateDialogOpen(true);
        }
      }}
    />
  ) : (
    <>
      {sessions.map((session) => (
        <GroupCard
          key={session.sid}
          icon={<MdGroups className="h-8 w-8 text-white" />}
          title={session.name}
          participants={session.membersCount}
          showActions
          onEdit={() => setIsEditModalOpen(true, { itemEditName: session.name, type: ItemTypes.SESSION })}
          onCopy={() => setIsCopyModalOpen(true, { itemEditName: session.name, type: ItemTypes.SESSION })}
          onDelete={() => setIsDeleteModalOpen(true, { itemEditName: session.name, type: ItemTypes.SESSION })}
          onItemClicked={() => handleItemClicked(session.name)}
        />
      ))}
      <GroupCard
        title={translateKey('schoolManagement.newGroup')}
        isAddNew
        onAdd={() => {
          if (setIsCreateDialogOpen && setDialogTitle && setCreateContentType) {
            setDialogTitle(translateKey('schoolManagement.createGroup'));
            setCreateContentType(CreateContentTypes.CREATE_GROUP);
            setIsCreateDialogOpen(true);
          }
        }}
      />
    </>
  );
};

export default SessionContent;
