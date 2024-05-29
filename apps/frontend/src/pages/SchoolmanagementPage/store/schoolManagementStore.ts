import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import lmnApi from '@/api/lmnApi';
import eduApi from '@/api/eduApi';
import { GroupInfo } from '@/pages/SchoolmanagementPage/utilis/groups';
import { CustomIdTokenClaims, Project, UserInitialPasswordInfo } from '@/pages/SchoolmanagementPage/utilis/types';
import { SessionInfoState } from '@/datatypes/sessionInfo';
import { transformGroupsToSchools } from '@/pages/SchoolmanagementPage/utilis/utilitys';
import { DetailedUserInfo, LDAPUser } from './ldapUser';

interface SchoolmanagementStates {
  schoolclasses: Record<string, LDAPUser[]>;
  allProjects: Project[];
  availableSessions: SessionInfoState[];
  members: Record<string, DetailedUserInfo>;
  groupsData: {
    schools: {
      id: string;
      name: string;
      classes: GroupInfo[];
      printers: GroupInfo[];
      projects: GroupInfo[];
    }[];
  };
}

interface SchoolmanagementActions {
  createSession: (user: string, name: string) => Promise<void>;
  createProject: (user: string, name: string, school: string) => Promise<void>;
  getSessions: (user: string) => Promise<void>;
  deleteSession: (user: string, sid: string) => Promise<void>;
  fetchInitialPasswords: (className: string) => Promise<UserInitialPasswordInfo[]>;
  fetchAndStoreAllClasses: (classes: string[], userinfo: CustomIdTokenClaims) => Promise<void>;
  fetchGroupsData: () => Promise<void>;
  reset: () => void;
}

type SchoolclassInfoStore = SchoolmanagementStates & SchoolmanagementActions;

const initialState: Omit<
  SchoolclassInfoStore,
  | 'createSession'
  | 'createProject'
  | 'getSessions'
  | 'deleteSession'
  | 'fetchAndStoreAllClasses'
  | 'fetchInitialPasswords'
  | 'fetchGroupsData'
  | 'reset'
> = {
  schoolclasses: {},
  availableSessions: [],
  members: {},
  allProjects: [],
  groupsData: { schools: [] },
};

type PersistedSchoolManagementStore = (
  lessonData: StateCreator<SchoolclassInfoStore>,
  options: PersistOptions<SchoolclassInfoStore>,
) => StateCreator<SchoolclassInfoStore>;

const useSchoolManagementStore = create<SchoolclassInfoStore>(
  (persist as PersistedSchoolManagementStore)(
    (set) => ({
      ...initialState,
      createProject: async (user: string, name: string, school: string) => {
        try {
          await lmnApi.post(`/projects/${name}`, {
            description: 'ffefefefefefefefe',
            quota: '',
            mailquota: '',
            join: true,
            hide: false,
            admins: [],
            admingroups: [],
            members: [user],
            membergroups: [],
            school,
          });
        } catch (error) {
          console.error('Failed to create project:', error);
        }
      },

      createSession: async (user: string, name: string) => {
        try {
          await lmnApi.post(`/sessions/${user}/${name}`);
        } catch (error) {
          console.error('Failed to create group:', error);
        }
      },

      getSessions: async (user: string) => {
        try {
          const response = await lmnApi.get(`/sessions/${user}`);
          set({ availableSessions: response.data as SessionInfoState[] });
        } catch (error) {
          console.error('Failed to fetch sessions info:', error);
        }
      },

      deleteSession: async (user: string, sid: string) => {
        try {
          await lmnApi.delete(`/sessions/${user}/${sid}`).catch(console.error);
        } catch (error) {
          console.error('Failed to delete session:', error);
        }
      },

      fetchInitialPasswords: async (className: string): Promise<UserInitialPasswordInfo[]> => {
        const response = await lmnApi.get(`/schoolclasses/${className}/first_passwords`);
        const data = response.data as Record<string, { firstPassword: string; firstPasswordStillSet: boolean }>;

        return Object.entries(data).map(([username, info]) => ({
          username,
          firstPassword: info.firstPassword,
          firstPasswordStillSet: info.firstPasswordStillSet,
        })) as UserInitialPasswordInfo[];
      },

      fetchGroupsData: async () => {
        try {
          const response = await eduApi.get<GroupInfo[]>('/classmanagement/groups');
          const groups = response.data;
          const schoolData = transformGroupsToSchools(groups);

          set((state) => ({
            groupsData: {
              ...state.groupsData,
              schools: schoolData,
            },
          }));
        } catch (error) {
          console.error('Failed to fetch groups data:', error);
        }
      },

      fetchAndStoreAllClasses: async (classes, userInfo) => {
        try {
          const excludedMemberName = 'agy-netzint-teacher';

          const classInfoPromises = classes?.map(async (className) => {
            const response = await eduApi.get(`/classmanagement/${className}`);
            const classInfo = response.data as LDAPUser[];
            classInfo.filter((member) => !member.username.includes(excludedMemberName));

            return { [className]: classInfo };
          });

          const classInfoArray = await Promise.all(classInfoPromises);

          const validClassInfoArray = classInfoArray.filter((info) => info !== null);

          const classInfoMap = validClassInfoArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          Object.entries(classInfoMap).forEach(([key, members]) => {
            classInfoMap[key] = members.filter((member) => member.email !== userInfo.email);
          });

          set((state) => ({
            schoolclasses: {
              ...state.schoolclasses,
              ...classInfoMap,
            },
          }));
        } catch (error) {
          console.error('Failed to fetch class information:', error);
        }
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'schoolManagementStore',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        schoolclasses: state.schoolclasses,
        members: state.members,
        availableSessions: state.availableSessions,
      }),
    } as PersistOptions<SchoolclassInfoStore>,
  ),
);

export default useSchoolManagementStore;
