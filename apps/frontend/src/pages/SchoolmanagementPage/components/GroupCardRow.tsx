import React, { FC } from 'react';
import { GroupCardRowProps } from '@/pages/SchoolmanagementPage/utilis/types.ts';
import SessionContent from '@/pages/SchoolmanagementPage/components/contents/SessionContent.tsx';
import ClassContent from '@/pages/SchoolmanagementPage/components/contents/ClassContent.tsx';
import ProjectContent from '@/pages/SchoolmanagementPage/components/contents/ProjectContent.tsx';

const GroupCardRow: FC<GroupCardRowProps> = ({
  schoolclasses,
  sessions,
  projects,
  setIsCreateDialogOpen,
  setDialogTitle,
  setCreateContentType,
  isAdmin,
  deleteSession,
}) => {
  const cardVisibleOrder = 'flex flex-wrap gap-4';

  if (schoolclasses) {
    return (
      <div className={cardVisibleOrder}>
        <ClassContent
          schoolclasses={schoolclasses}
          isAdmin={false}
        />
      </div>
    );
  }
  if (sessions) {
    return (
      <div className={cardVisibleOrder}>
        <SessionContent
          sessions={sessions}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          setDialogTitle={setDialogTitle}
          setCreateContentType={setCreateContentType}
          isAdmin={isAdmin}
          deleteSession={deleteSession}
        />
      </div>
    );
  }

  return (
    <div className={cardVisibleOrder}>
      <ProjectContent
        projects={projects}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        setDialogTitle={setDialogTitle}
        setCreateContentType={setCreateContentType}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default GroupCardRow;
