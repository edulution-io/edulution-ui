import {
  ClassManagementIcon,
  CreateProjectIcon,
  EnrolIcon,
  FirstPasswordIcon,
  LearningManagementIcon,
} from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import {
  CLASS_MANAGEMENT_ENROL_PATH,
  CLASS_MANAGEMENT_LESSON_PATH,
  CLASS_MANAGEMENT_PRINT_PASSWORDS_PATH,
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
        id: 'lesson',
        label: 'classmanagement.lesson',
        icon: LearningManagementIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_LESSON_PATH);
        },
      },
      {
        id: 'enrol',
        label: 'classmanagement.enrol',
        icon: EnrolIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_ENROL_PATH);
        },
      },
      {
        id: 'printPasswords',
        label: 'classmanagement.printPasswords',
        icon: FirstPasswordIcon,
        action: () => {
          navigate(CLASS_MANAGEMENT_PRINT_PASSWORDS_PATH);
        },
      },
      {
        id: 'myProjects',
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
