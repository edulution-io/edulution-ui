import Session from '@libs/classManagement/types/session';
import UserInitialPasswordInfo from '@libs/classManagement/types/userIntialPasswordInfo';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import GroupDto from '@libs/groups/types/group.dto';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';

interface ClassManagementState {
  userSessions: LmnApiSession[];
  areUserSessionsLoading: boolean;
  userProjects: LmnApiProject[];
  areUserProjectsLoading: boolean;
  userSchoolClasses: LmnApiSchoolClass[];
  areUserSchoolClassesLoading: boolean;
  isDialogLoading: boolean;
  initialPasswords: UserInitialPasswordInfo[];
  searchGroupsError: Error | null;
  searchGroupsIsLoading: boolean;
  selectedGroup: GroupDto | Session | null;
  error: Error | null;
}

interface ClassManagementActions {
  fetchInitialPasswords: (className: string) => Promise<void>;
  reset: () => void;
  searchGroupsOrUsers: (searchQuery: string) => Promise<(MultipleSelectorGroup & LmnApiSearchResult)[]>;
  searchGroups: (searchQuery: string) => Promise<MultipleSelectorGroup[]>;
  createSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  createProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  deleteSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  fetchSchoolClass: (name: string) => Promise<LmnApiSchoolClass | null>;
  fetchUserSchoolClasses: () => Promise<void>;
  fetchProject: (name: string) => Promise<LmnApiProject | null>;
  fetchUserProjects: () => Promise<void>;
  fetchSession: (name: string) => Promise<LmnApiSession | null>;
  fetchUserSessions: () => Promise<void>;
}

type ClassManagementStore = ClassManagementState & ClassManagementActions;

export default ClassManagementStore;
