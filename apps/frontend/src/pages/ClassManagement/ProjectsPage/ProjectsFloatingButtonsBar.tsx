import React from 'react';
import { t } from 'i18next';
import UserGroups from '@libs/groups/types/userGroups.enum';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import { MdAdd } from 'react-icons/md';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

const ProjectsFloatingButtonsBar = () => {
  const { setOpenDialogType } = useLessonStore();

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: MdAdd,
        text: t(`classmanagement.createmyProjects`),
        onClick: () => setOpenDialogType(UserGroups.Projects),
      },
    ],
    keyPrefix: 'class-management-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default ProjectsFloatingButtonsBar;
