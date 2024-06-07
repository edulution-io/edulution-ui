import { FC, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GroupCard from '@/pages/SchoolmanagementPage/components/GroupCard.tsx';
import { translateKey } from '@/utils/common.ts';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes.ts';
import { MdGroups } from 'react-icons/md';
import { GroupCardRowProps } from '@/pages/SchoolmanagementPage/utilis/types.ts';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';
import { ItemTypes } from '@/pages/SchoolmanagementPage/utilis/enums.ts';

const ProjectContent: FC<GroupCardRowProps> = ({
  projects,
  setIsCreateDialogOpen,
  setDialogTitle,
  setCreateContentType,
  isAdmin,
}) => {
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsEditModalOpen, setIsDeleteModalOpen, setIsCopyModalOpen } = useSchoolManagementComponentStore();

  const appendSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  };

  const handleItemClicked = (projectName: string) => {
    if (activeProject === projectName) {
      setActiveProject(undefined);
      appendSearchParams('project', '');
      return;
    }
    setActiveProject(projectName);
    appendSearchParams('project', projectName);
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
      {Object.entries(projects).map(([project, members]) => (
        <GroupCard
          key={project}
          icon={<MdGroups className="h-8 w-8 text-white" />}
          title={project}
          participants={Object.keys(members).length}
          showActions={isAdmin}
          onEdit={() => setIsEditModalOpen(true, { itemEditName: project, type: ItemTypes.PROJECT })}
          onCopy={() => setIsCopyModalOpen(true, { itemEditName: project, type: ItemTypes.PROJECT })}
          onDelete={() => setIsDeleteModalOpen(true, { itemEditName: project, type: ItemTypes.PROJECT })}
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
export default ProjectContent;
