import React from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { t } from 'i18next';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import UserGroups from '@libs/groups/types/userGroups.enum';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { MdAdd } from 'react-icons/md';

const ProjectsFloatingButtonsBar = () => {
  const { setOpenDialogType } = useLessonStore();

  return (
    <div className="fixed bottom-8 flex flex-row space-x-8 bg-opacity-90">
      <TooltipProvider>
        <div className="flex flex-row items-center space-x-8">
          <FloatingActionButton
            icon={MdAdd}
            text={t(`classmanagement.createmyProjects`)}
            onClick={() => setOpenDialogType(UserGroups.Projects)}
          />
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ProjectsFloatingButtonsBar;
