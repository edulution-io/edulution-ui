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

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type Section from '@libs/menubar/section';
import {
  CHAT_CLASSES_LOCATION,
  CHAT_DIRECT_LOCATION,
  CHAT_GROUPS_LOCATION,
  CHAT_PATH,
  CHAT_PROJECTS_LOCATION,
} from '@libs/chat/constants/chatPaths';
import isValidGroupTypeLocation from '@libs/chat/utils/isValidGroupTypeLocation';
import removeSchoolPrefix from '@libs/classManagement/utils/removeSchoolPrefix';
import useChatStore from '@/pages/Chat/useChatStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import useSubMenuStore from '@/store/useSubMenuStore';

const useRegisterChatSections = () => {
  const navigate = useNavigate();
  const { groupType } = useParams<{ groupType: string; groupName: string }>();
  const { userGroups, fetchUserGroups, contacts, fetchContacts } = useChatStore();
  const { user } = useLmnApiStore();
  const { setSections, setSectionsByParent } = useSubMenuStore();

  useEffect(() => {
    if (!userGroups) {
      void fetchUserGroups();
    }
  }, [userGroups, fetchUserGroups]);

  useEffect(() => {
    if (groupType === CHAT_DIRECT_LOCATION && contacts.length === 0) {
      void fetchContacts();
    }
  }, [groupType, contacts.length, fetchContacts]);

  const mapGroupsToSections = (groups: { name: string; path: string }[], location: string): Section[] =>
    groups.map((group) => ({
      id: group.name,
      label: removeSchoolPrefix(group.name, user?.school),
      action: () => navigate(`/${CHAT_PATH}/${location}/${encodeURIComponent(group.name)}`),
    }));

  const contactSections: Section[] = useMemo(
    () =>
      contacts.map((contact) => ({
        id: contact.username,
        label: `${contact.firstName} ${contact.lastName}`,
        action: () => navigate(`/${CHAT_PATH}/${CHAT_DIRECT_LOCATION}/${encodeURIComponent(contact.username)}`),
      })),
    [contacts, navigate],
  );

  const sections: Section[] = useMemo(() => {
    if (!isValidGroupTypeLocation(groupType)) return [];

    if (groupType === CHAT_DIRECT_LOCATION) return contactSections;

    if (!userGroups) return [];

    if (groupType === CHAT_CLASSES_LOCATION) return mapGroupsToSections(userGroups.classes, CHAT_CLASSES_LOCATION);
    if (groupType === CHAT_GROUPS_LOCATION) return mapGroupsToSections(userGroups.groups, CHAT_GROUPS_LOCATION);
    return mapGroupsToSections(userGroups.projects, CHAT_PROJECTS_LOCATION);
  }, [userGroups, groupType, navigate, user?.school, contactSections]);

  useEffect(() => {
    setSections(sections, groupType);
  }, [sections, setSections, groupType]);

  const allSectionsByParent: Record<string, Section[]> = useMemo(() => {
    const result: Record<string, Section[]> = {};

    if (userGroups) {
      if (userGroups.classes.length > 0) {
        result[CHAT_CLASSES_LOCATION] = mapGroupsToSections(userGroups.classes, CHAT_CLASSES_LOCATION);
      }
      if (userGroups.projects.length > 0) {
        result[CHAT_PROJECTS_LOCATION] = mapGroupsToSections(userGroups.projects, CHAT_PROJECTS_LOCATION);
      }
      if (userGroups.groups.length > 0) {
        result[CHAT_GROUPS_LOCATION] = mapGroupsToSections(userGroups.groups, CHAT_GROUPS_LOCATION);
      }
    }

    if (contactSections.length > 0) {
      result[CHAT_DIRECT_LOCATION] = contactSections;
    }

    return result;
  }, [userGroups, contactSections, navigate, user?.school]);

  useEffect(() => {
    setSectionsByParent(allSectionsByParent);
  }, [allSectionsByParent, setSectionsByParent]);
};

export default useRegisterChatSections;
