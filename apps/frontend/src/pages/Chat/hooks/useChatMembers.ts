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

import { useEffect, useRef, useState } from 'react';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import type LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import waitForGroupLoadReady from '@libs/chat/utils/waitForGroupLoadReady';
import collectChatParticipants from '@libs/chat/utils/collectChatParticipants';
import createParticipantsMap from '@libs/chat/utils/createParticipantsMap';
import getParticipantsArray from '@libs/chat/utils/getParticipantsArray';
import { ChatGroupType } from '@libs/chat/types/chatGroupType';

interface UseChatMembersPropsMultiple {
  schoolClasses: LmnApiSchoolClass[];
  projects: LmnApiProject[];
  groupsKey: string | null;
  groupCn?: never;
  groupType?: never;
}

interface UseChatMembersPropsSingle {
  groupCn: string;
  groupType: ChatGroupType;
  schoolClasses?: never;
  projects?: never;
  groupsKey?: never;
}

type UseChatMembersProps = UseChatMembersPropsMultiple | UseChatMembersPropsSingle;

const useChatMembers = (props: UseChatMembersProps) => {
  const { user } = useLmnApiStore();
  const { fetchSchoolClass, fetchProject } = useClassManagementStore();

  const [members, setMembers] = useState<LmnUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadedKeyRef = useRef<string | null>(null);

  const currentUserCn = user?.cn;
  const isSingleMode = 'groupCn' in props && props.groupCn;

  useEffect(() => {
    const loadSingleGroup = async (groupCn: string, groupType: ChatGroupType) => {
      const participants = createParticipantsMap();

      const isClass = groupType === 'class';
      const getIsLoading = isClass
        ? () => useClassManagementStore.getState().isSchoolClassLoading
        : () => useClassManagementStore.getState().isProjectLoading;

      await waitForGroupLoadReady(getIsLoading);
      const result = isClass ? await fetchSchoolClass(groupCn) : await fetchProject(groupCn);

      if (result) {
        collectChatParticipants(participants, result.members, result.admins, currentUserCn);
      }

      return getParticipantsArray(participants);
    };

    const loadMultipleGroups = async (schoolClasses: LmnApiSchoolClass[], projects: LmnApiProject[]) => {
      const participants = createParticipantsMap();

      await schoolClasses.reduce(async (prevPromise, sc) => {
        await prevPromise;
        await waitForGroupLoadReady(() => useClassManagementStore.getState().isSchoolClassLoading);
        const result = await fetchSchoolClass(sc.cn);
        if (result) {
          collectChatParticipants(participants, result.members, result.admins, currentUserCn);
        }
      }, Promise.resolve());

      await projects.reduce(async (prevPromise, p) => {
        await prevPromise;
        await waitForGroupLoadReady(() => useClassManagementStore.getState().isProjectLoading);
        const result = await fetchProject(p.cn);
        if (result) {
          collectChatParticipants(participants, result.members, result.admins, currentUserCn);
        }
      }, Promise.resolve());

      return getParticipantsArray(participants);
    };

    const loadMembers = async () => {
      setIsLoading(true);

      try {
        let result: LmnUserInfo[];

        if (isSingleMode) {
          const { groupCn, groupType } = props;
          if (loadedKeyRef.current === groupCn) return;
          loadedKeyRef.current = groupCn;
          result = await loadSingleGroup(groupCn, groupType);
        } else {
          const { schoolClasses, projects, groupsKey } = props as UseChatMembersPropsMultiple;
          if (!groupsKey || loadedKeyRef.current === groupsKey) return;
          loadedKeyRef.current = groupsKey;
          result = await loadMultipleGroups(schoolClasses, projects);
        }

        setMembers(result);
      } catch (error) {
        console.error('Error loading chat members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadMembers();
  }, [isSingleMode, props, currentUserCn, fetchSchoolClass, fetchProject]);

  useEffect(() => {
    const currentKey = isSingleMode ? props.groupCn : (props as UseChatMembersPropsMultiple).groupsKey;

    if (currentKey && loadedKeyRef.current !== currentKey) {
      setMembers([]);
    }
  }, [isSingleMode, props]);

  return { members, isLoading };
};

export default useChatMembers;
