import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes';
import React, { FC, useState } from 'react';
import GroupCard from '@/pages/SchoolmanagementPage/components/GroupCard';
import { MdGroups } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { SessionInfo } from '@/datatypes/sessionInfo';
import { MemberInfo } from '@/datatypes/schoolclassInfo';
import { translateKey } from '@/utils/common.ts';

interface GroupCardRowProps {
  schoolclasses?: Record<string, MemberInfo>;
  sessions?: SessionInfo[];
  projects?: string[];
  setIsCreateDialogOpen?: (isOpen: boolean) => void;
  isCreateDialogOpen?: boolean;
  setDialogTitle?: (title: string) => void;
  setCreateContentType?: (type: CreateContentTypes) => void;
  isAdmin: boolean;
  deleteSession?: (sid: string) => Promise<void>;
}

const ClassContent: FC<GroupCardRowProps> = ({ schoolclasses }) => {
  const [activeClass, setActiveClass] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const appendSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  };

  const handleItemClicked = (className: string) => {
    if (activeClass === className) {
      setActiveClass(undefined);
      appendSearchParams('class', '');
      return;
    }
    setActiveClass(className);
    appendSearchParams('class', className);
  };

  return !schoolclasses || Object.keys(schoolclasses).length === 0 ? (
    <p>No schoolclass data available. {activeClass}</p>
  ) : (
    <>
      {Object.entries(schoolclasses).map(([className, members]) => (
        <GroupCard
          key={className}
          icon={<MdGroups className="h-8 w-8 text-white" />}
          title={className}
          participants={Object.keys(members).length}
          showActions={false}
          onEdit={() => {}}
          onCopy={() => {}}
          onDelete={() => {}}
          onItemClicked={() => handleItemClicked(className)}
          isComponentSelected={activeClass === className}
        />
      ))}
    </>
  );
};

const SessionContent: FC<GroupCardRowProps> = ({
  sessions,
  setIsCreateDialogOpen,
  setDialogTitle,
  setCreateContentType,
  deleteSession,
}) => {
  const [activeSession, setActiveSession] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

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
          onEdit={() => {}}
          onCopy={() => {}}
          onDelete={() => deleteSession && deleteSession(session.sid)}
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

const ProjectContent: FC<GroupCardRowProps> = ({
  projects,
  setIsCreateDialogOpen,
  setDialogTitle,
  setCreateContentType,
  isAdmin,
}) => {
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const appendSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  };

  const handleItemClicked = (className: string) => {
    if (activeProject === className) {
      setActiveProject(undefined);
      appendSearchParams('project', '');
      return;
    }
    setActiveProject(className);
    appendSearchParams('project', className);
  };

  return !projects ? (
    <GroupCard
      title={translateKey('schoolManagement.newProject')}
      isAddNew
      onAdd={() => {
        if (setIsCreateDialogOpen && setDialogTitle && setCreateContentType) {
          setDialogTitle(translateKey('schoolManagement.createProject'));
          setIsCreateDialogOpen(true);
          setCreateContentType(CreateContentTypes.CREATE_PROJECT);
        }
      }}
    />
  ) : (
    <>
      {projects.map((project) => (
        <GroupCard
          key={project}
          icon={<MdGroups className="h-8 w-8 text-white" />}
          title={project}
          participants={0}
          showActions={isAdmin}
          onEdit={() => {}}
          onCopy={() => {}}
          onDelete={() => {}}
          onItemClicked={() => handleItemClicked(project)}
        />
      ))}
      {isAdmin && (
        <GroupCard
          title={translateKey('schoolManagement.newProject')}
          isAddNew
          onAdd={() => {
            if (setIsCreateDialogOpen && setDialogTitle && setCreateContentType) {
              setDialogTitle(translateKey('schoolManagement.createProject'));
              setIsCreateDialogOpen(true);
              setCreateContentType(CreateContentTypes.CREATE_PROJECT);
            }
          }}
        />
      )}
    </>
  );
};

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
