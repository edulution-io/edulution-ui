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

import UserGroups from '@libs/groups/types/userGroups.enum';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';

interface LessonState {
  isLoading: boolean;
  error: Error | null;
  openDialogType: UserGroups | null;
  userGroupToEdit: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null;
  member: LmnUserInfo[];
  groupTypeFromStore: string | undefined;
  groupNameFromStore: string | undefined;
}

interface LessonActions {
  reset: () => void;
  shareFiles: (duplicateFileRequestDto: DuplicateFileRequestDto, share: string | undefined) => Promise<void>;
  collectFiles: (
    collectFileRequestDTO: CollectFileRequestDTO[],
    userRole: string,
    type: LmnApiCollectOperationsType,
    share: string | undefined,
  ) => Promise<void>;
  addManagementGroup: (group: string, users: string[]) => Promise<void>;
  removeManagementGroup: (group: string, users: string[]) => Promise<void>;
  startExamMode: (users: string[]) => Promise<void>;
  stopExamMode: (users: string[], groupName?: string, groupType?: string) => Promise<void>;
  toggleSchoolClassJoined: (isAlreadyJoined: boolean, schoolClass: string) => Promise<void>;
  togglePrinterJoined: (isAlreadyJoined: boolean, printer: string) => Promise<void>;
  toggleProjectJoined: (isAlreadyJoined: boolean, project: string) => Promise<void>;
  setOpenDialogType: (type: UserGroups | null) => void;
  setUserGroupToEdit: (group: LmnApiSession | LmnApiProject | LmnApiSchoolClass | null) => void;
  setMember: (member: LmnUserInfo[]) => void;
  setGroupTypeInStore: (groupType?: string) => void;
  setGroupNameInStore: (groupName?: string) => void;
}

type LessonStore = LessonState & LessonActions;

export default LessonStore;
