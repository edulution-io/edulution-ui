import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import lmnApi from '@/api/lmnApi';
import eduApi from '@/api/eduApi';
import { GroupInfo } from '@/pages/SchoolmanagementPage/utilis/groups';
import { CustomIdTokenClaims, UserInitialPasswordInfo } from '@/pages/SchoolmanagementPage/utilis/types';
import { SessionInfoState } from '@/datatypes/sessionInfo';
import { fetchAndFilterData, transformGroupsToSchools } from '@/pages/SchoolmanagementPage/utilis/utilitys';
import { DetailedUserInfo, LDAPUser } from './ldapUser';
import lmnRootAdminApi from '@/api/lmnRootAdminApi.ts';
import { AxiosError } from 'axios';

interface SchoolmanagementStates {
  schoolclasses: Record<string, LDAPUser[]>;
  projects: Record<string, LDAPUser[]>;
  allSchoolProjects: Record<string, LDAPUser[]>;
  allSchoolClasses: Record<string, LDAPUser[]>;
  allSchoolPrinters: Record<string, LDAPUser[]>;
  error: AxiosError | null;
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
  fetchAndStoreUserProjectsAndClasses: (
    classes: string[],
    projects: string[],
    userinfo: CustomIdTokenClaims,
  ) => Promise<void>;

  fetchAndStoreAllUserProjectsClassesAndPrinters: (
    classes: string[],
    projects: string[],
    printers: string[],
    userinfo: CustomIdTokenClaims,
  ) => Promise<void>;

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
  | 'fetchAndStoreUserProjectsAndClasses'
  | 'fetchAndStoreAllUserProjectsClassesAndPrinters'
  | 'fetchInitialPasswords'
  | 'fetchGroupsData'
  | 'reset'
> = {
  allSchoolProjects: {},
  allSchoolClasses: {},
  allSchoolPrinters: {},
  projects: {},
  error: null,
  schoolclasses: {},
  availableSessions: [],
  members: {},
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
          await lmnRootAdminApi.post(`/projects/${name}`, {
            description: 'ffefefefefefefefe',
            quota: '',
            mailquota: '',
            join: true,
            hide: false,
            admins: [user],
            admingroups: [],
            members: ['agy-netzint5'],
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

          console.log(response.data);
          const groups = response.data;
          const schoolData = transformGroupsToSchools(groups);

          console.log(schoolData);

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

      fetchAndStoreUserProjectsAndClasses: async (classes, projects, userInfo) => {
        try {
          const classInfoMap = await fetchAndFilterData(classes, 'classmanagement', userInfo, true);
          const projectInfoMap = await fetchAndFilterData(projects, 'classmanagement', userInfo, true);

          set((state) => ({
            schoolclasses: {
              ...state.schoolclasses,
              ...classInfoMap,
            },
          }));
          set((state) => ({
            projects: {
              ...state.projects,
              ...projectInfoMap,
            },
          }));
        } catch (error) {
          console.error('Failed to fetch class information:', error);
        }
      },

      fetchAndStoreAllUserProjectsClassesAndPrinters: async (classes, projects, printers, userInfo) => {
        console.log('Fetching all user projects, classes and printers', classes, projects, printers, userInfo);
        const classInfoMap = await fetchAndFilterData(classes, 'classmanagement', userInfo, false);
        const projectInfoMap = await fetchAndFilterData(projects, 'classmanagement', userInfo, false);
        const printersInfoMap = await fetchAndFilterData(printers, 'classmanagement', userInfo, false);

        console.log('classInfoMap', classInfoMap);

        set((state) => ({
          allSchoolClasses: {
            ...state.allSchoolClasses,
            ...classInfoMap,
          },
        }));
        set((state) => ({
          allSchoolProjects: {
            ...state.allSchoolProjects,
            ...projectInfoMap,
          },
        }));
        set((state) => ({
          allSchoolPrinters: {
            ...state.allSchoolPrinters,
            ...printersInfoMap,
          },
        }));
        console.log('Fetched all user projects, classes and printers');
      },

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'schoolManagementStore',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        schoolclasses: state.schoolclasses,
        allSchoolProjects: state.allSchoolProjects,
        allSchoolClasses: state.allSchoolClasses,
        allSchoolPrinters: state.allSchoolPrinters,
        members: state.members,
        projects: state.projects,
        availableSessions: state.availableSessions,
      }),
    } as PersistOptions<SchoolclassInfoStore>,
  ),
);

export default useSchoolManagementStore;
