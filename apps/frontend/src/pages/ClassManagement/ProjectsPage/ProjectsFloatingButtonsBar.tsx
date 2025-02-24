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
