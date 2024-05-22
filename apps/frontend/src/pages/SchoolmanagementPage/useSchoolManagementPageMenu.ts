import { MenuBarEntryProps } from '@/datatypes/types.ts';
import { SchoolManagementIcon } from '@/assets/icons';
import { useSearchParams } from 'react-router-dom';

const useSchoolManagementPageMenu = () => {
  const [, setSearchParams] = useSearchParams();
  const menuBar = (): MenuBarEntryProps => ({
    title: 'schoolManagement.title',
    icon: SchoolManagementIcon,
    color: 'hover:bg-ciLightBlue',
    menuItems: [
      {
        id: 'lesson',
        label: 'schoolManagement.lesson',
        icon: SchoolManagementIcon,
        action: () => {
          setSearchParams({ page: 'lesson' });
        },
      },
      {
        id: 'enrol',
        label: 'schoolManagement.enrol',
        icon: SchoolManagementIcon,
        action: () => {
          setSearchParams({ page: 'enrol' });
        },
      },
      {
        id: 'passwords',
        label: 'schoolManagement.passwords',
        icon: SchoolManagementIcon,
        action: () => {
          setSearchParams({ page: 'passwords' });
        },
      },
      {
        id: 'project',
        label: 'schoolManagement.project',
        icon: SchoolManagementIcon,
        action: () => {
          setSearchParams({ page: 'project' });
        },
      },
    ],
  });
  return menuBar();
};
export default useSchoolManagementPageMenu;
