/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { UseFormReturn } from 'react-hook-form';
import { TFunction } from 'i18next';
import type GroupForm from '@libs/groups/types/groupForm';
import type LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import type LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import type LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import type LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import type LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import type LmnApiSchoolClassWithMembers from '@libs/lmnApi/types/lmnApiSchoolClassWithMembers';
import type LmnApiRoom from '@libs/lmnApi/types/lmnApiRoom';
import type LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import type LmnApiPrinterWithMembers from '@libs/lmnApi/types/lmnApiPrinterWithMembers';
import type LmnApiSchools from '@libs/lmnApi/types/lmnApiSchools';

interface ClassManagementState {
  userSessions: LmnApiSession[];
  isLoading: boolean;
  isRoomLoading: boolean;
  isPrinterLoading: boolean;
  arePrintersLoading: boolean;
  isSessionLoading: boolean;
  areSessionsLoading: boolean;
  isProjectLoading: boolean;
  areProjectsLoading: boolean;
  isSchoolClassLoading: boolean;
  areSchoolClassesLoading: boolean;
  userProjects: LmnApiProject[];
  userSchoolClasses: LmnApiSchoolClass[];
  searchGroupsError: Error | null;
  isSearchGroupsLoading: boolean;
  error: Error | null;
  userRoom: LmnApiRoom | null;
  printers: LmnApiPrinter[];
  schools: LmnApiSchools[];
  selectedSchool: string;
}

interface ClassManagementActions {
  reset: () => void;
  setSelectedSchool: (school: string) => void;
  searchGroupsOrUsers: (
    searchQuery: string,
    t: TFunction<'translation', undefined>,
  ) => Promise<(MultipleSelectorGroup & LmnApiSearchResult)[]>;
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
  fetchUserSessions: (withMemberDetails: boolean) => Promise<LmnApiSession[]>;
  fetchRoom: () => Promise<void>;
  fetchPrinters: () => Promise<void>;
  fetchPrinter: (name: string) => Promise<LmnApiPrinterWithMembers | null>;
  getSchools: () => Promise<void>;
}

type ClassManagementStore = ClassManagementState & ClassManagementActions;

export default ClassManagementStore;
