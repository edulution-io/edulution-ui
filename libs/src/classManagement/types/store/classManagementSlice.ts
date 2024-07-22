import { AxiosError } from 'axios';
import { Group } from '@libs/groups/types/group';
import Session from '@libs/classManagement/types/session';
import LdapUserWithGroups from '@libs/groups/types/ldapUserWithGroups';
import UserInitialPasswordInfo from '@libs/classManagement/types/userIntialPasswordInfo';
import Classes from '@libs/classManagement/types/classes';
import UserGroupsDto from '@libs/groups/types/userGroups.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import GroupDto from '@libs/groups/types/group.dto';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';

interface ClassManagementState {
  userGroups: UserGroupsDto;
  areUserGroupsLoading: boolean;
  isDialogLoading: boolean;
  initialPasswords: UserInitialPasswordInfo[];
  searchGroupsError: Error | null;
  searchGroupsIsLoading: boolean;
  selectedGroup: GroupDto | Session | null;

  classes: Classes;
  projects: Classes;
  allSchoolProjects: Classes;
  allSchoolClasses: Classes;
  allSchoolPrinters: Classes;
  error: AxiosError | null;
  availableSessions: Session[];
  members: Record<string, LdapUserWithGroups>;
  groupsData: {
    schools: {
      id: string;
      name: string;
      classes: Group[];
      printers: Group[];
      projects: Group[];
    }[];
  };
}

interface ClassManagementActions {
  fetchInitialPasswords: (className: string) => Promise<void>;
  fetchUserGroups: (username: string) => Promise<void>;
  reset: () => void;
  searchGroupsOrUsers: (searchQuery: string) => Promise<(MultipleSelectorGroup & LmnApiSearchResult)[]>;
  searchGroups: (searchQuery: string) => Promise<MultipleSelectorGroup[]>;
  createSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  createProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  deleteSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  fetchSchoolClass: (schoolClassName: string) => Promise<LmnApiSchoolClass | null>;
  fetchProject: (projectName: string) => Promise<LmnApiProject | null>;
}

type ClassManagementSlice = ClassManagementState & ClassManagementActions;

export default ClassManagementSlice;
