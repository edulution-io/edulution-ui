import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';

interface ClassManagementState {
  userSessions: LmnApiSession[];
  isLoading: boolean;
  isRoomLoading: boolean;
  isSessionLoading: boolean;
  isProjectLoading: boolean;
  isSchoolClassLoading: boolean;
  userProjects: LmnApiProject[];
  userSchoolClasses: LmnApiSchoolClass[];
  searchGroupsError: Error | null;
  isSearchGroupsLoading: boolean;
  error: Error | null;
  userRoom: LmnApiRoom | null;
}

interface ClassManagementActions {
  reset: () => void;
  searchGroupsOrUsers: (searchQuery: string) => Promise<(MultipleSelectorGroup & LmnApiSearchResult)[]>;
  createSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  updateSession: (form: UseFormReturn<GroupForm>) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  createProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  updateProject: (form: UseFormReturn<GroupForm>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchSchoolClass: (name: string) => Promise<LmnApiSchoolClassWithMembers | null>;
  fetchUserSchoolClasses: () => Promise<void>;
  fetchProject: (name: string) => Promise<LmnApiProjectWithMembers | null>;
  fetchUserProjects: () => Promise<void>;
  fetchUserSession: (name: string) => Promise<LmnApiSession | null>;
  fetchUserSessions: () => Promise<void>;
  fetchRoom: () => Promise<void>;
}

type ClassManagementStore = ClassManagementState & ClassManagementActions;

export default ClassManagementStore;
