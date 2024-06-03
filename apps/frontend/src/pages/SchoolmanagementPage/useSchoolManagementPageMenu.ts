import { MenuBarEntryProps } from '@/datatypes/types';
import {
  CreateProjectIcon,
  EnrolIcon,
  FirstPasswordIcon,
  LearningManagementIcon,
  SchoolManagementIcon,
} from '@/assets/icons';
import { useSearchParams } from 'react-router-dom';

const useSchoolManagementPageMenu = () => {
  const [, setSearchParams] = useSearchParams();
  const menuBar = (): MenuBarEntryProps => ({
    title: 'schoolManagement.title',
    icon: SchoolManagementIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'lesson',
        label: 'schoolManagement.lesson',
        icon: LearningManagementIcon,
        action: () => {
          setSearchParams({ page: 'lesson' });
        },
      },
      {
        id: 'enrol',
        label: 'schoolManagement.enrol',
        icon: EnrolIcon,
        action: () => {
          setSearchParams({ page: 'enrol' });
        },
      },
      {
        id: 'passwords',
        label: 'schoolManagement.passwords',
        icon: FirstPasswordIcon,
        action: () => {
          setSearchParams({ page: 'passwords' });
        },
      },
      {
        id: 'project',
        label: 'schoolManagement.project',
        icon: CreateProjectIcon,
        action: () => {
          setSearchParams({ page: 'project' });
        },
      },
    ],
  });
  return menuBar();
};
export default useSchoolManagementPageMenu;
