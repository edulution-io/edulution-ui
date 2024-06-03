import React, { FC } from 'react';
import GroupCardRow from '@/pages/SchoolmanagementPage/components/GroupCardRow';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes';
import { MemberInfo } from '@/datatypes/schoolclassInfo';
import { SessionInfo } from '@/datatypes/sessionInfo';

interface PathContentProps {
  pathType: 'schoolclasses' | 'sessions' | 'projects';
  data: Record<string, MemberInfo> | SessionInfo[] | string[];
  isAdmin: boolean;
  setDialogTitle?: (title: string) => void;
  setIsCreateDialogOpen?: (isOpen: boolean) => void;
  setCreateContentType?: (type: CreateContentTypes) => void;
  deleteSession?: (sid: string) => Promise<void>;
}

const PathContent: FC<PathContentProps> = ({
  pathType,
  data,
  isAdmin,
  setDialogTitle,
  setIsCreateDialogOpen,
  setCreateContentType,
  deleteSession,
}) => {
  return (
    <GroupCardRow
      {...(pathType === 'schoolclasses' && { schoolclasses: data as Record<string, MemberInfo> })}
      {...(pathType === 'sessions' && {
        sessions: data as SessionInfo[],
        setDialogTitle,
        setIsCreateDialogOpen,
        setCreateContentType,
        deleteSession,
      })}
      {...(pathType === 'projects' && {
        projects: data as Record<string, MemberInfo>,
        setDialogTitle,
        setIsCreateDialogOpen,
        setCreateContentType,
      })}
      isAdmin={isAdmin}
    />
  );
};

export default PathContent;
