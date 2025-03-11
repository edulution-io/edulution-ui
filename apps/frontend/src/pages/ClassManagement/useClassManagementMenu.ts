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

import {
  ClassManagementIcon,
  CreateProjectIcon,
  EnrolIcon,
  FirstPasswordIcon,
  LearningManagementIcon,
} from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import {
  CLASS_MANAGEMENT_ENROL_LOCATION,
  CLASS_MANAGEMENT_ENROL_PATH,
  CLASS_MANAGEMENT_LESSON_LOCATION,
  CLASS_MANAGEMENT_LESSON_PATH,
  CLASS_MANAGEMENT_PRINT_PASSWORDS_LOCATION,
  CLASS_MANAGEMENT_PRINT_PASSWORDS_PATH,
  CLASS_MANAGEMENT_PROJECTS_LOCATION,
  CLASS_MANAGEMENT_PROJECTS_PATH,
} from '@libs/classManagement/constants/classManagementPaths';
import APPS from '@libs/appconfig/constants/apps';
import MenuBarEntry from '@libs/menubar/menuBarEntry';

const useClassManagementMenu = () => {
  const navigate = useNavigate();
  const menuBar = (): MenuBarEntry => ({
    title: 'classmanagement.title',
    appName: APPS.CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: CLASS_MANAGEMENT_LESSON_LOCATION,
        label: 'classmanagement.lesson',
        icon: LearningManagementIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_LESSON_PATH);
        },
      },
      {
        id: CLASS_MANAGEMENT_ENROL_LOCATION,
        label: 'classmanagement.enrol',
        icon: EnrolIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_ENROL_PATH);
        },
      },
      {
        id: CLASS_MANAGEMENT_PRINT_PASSWORDS_LOCATION,
        label: 'classmanagement.printPasswords',
        icon: FirstPasswordIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_PRINT_PASSWORDS_PATH);
        },
      },
      {
        id: CLASS_MANAGEMENT_PROJECTS_LOCATION,
        label: 'classmanagement.myProjects',
        icon: CreateProjectIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_PROJECTS_PATH);
        },
      },
    ],
  });
  return menuBar();
};
export default useClassManagementMenu;
